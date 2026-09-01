# Assistente de IA — Agendamento por conversa

Documentação da implementação do assistente conversacional que permite ao gerente criar um agendamento de serviço conversando em linguagem natural, em vez de preencher o fluxo tradicional de telas. **Feature exclusiva da área do gerente** — não está disponível para o cliente.

## Visão geral

O assistente é um chat (tela `app/gerente/assistente.tsx`) onde o gerente troca mensagens com um modelo de IA para agendar serviços **em nome dos clientes** — nunca para o próprio gerente. O modelo pode chamar "ferramentas" (function calling) para consultar dados reais do sistema — serviços, veículos de qualquer cliente cadastrado, horários disponíveis — e, ao final, monta um resumo do agendamento para o gerente confirmar manualmente. **Nenhum agendamento é criado sem confirmação explícita do gerente na UI.**

Arquitetura em camadas:

```
app/gerente/assistente.tsx  Tela (UI pura, sem lógica de negócio)
  └─ hooks/useAssistente.ts  Orquestração da conversa + tool-calling
       ├─ services/AssistenteService.jsx   Proxy HTTP para o backend/IA
       ├─ services/ServicosService         Busca de serviços (tool)
       ├─ services/VeiculoService          Busca de veículos de qualquer cliente, por gestão (tool)
       └─ services/OrdemServicoService     Horários disponíveis + criação real do agendamento (via gestão)
  └─ hooks/useVoiceInput.ts   Interface preparada p/ entrada por voz (ainda não implementada)
  └─ components/
       ├─ UserMessage.tsx              Bolha de mensagem do usuário
       ├─ AssistantMessage.tsx         Bolha de mensagem da IA (com estado de erro)
       ├─ AssistantTypingIndicator.tsx Indicador "digitando…"
       └─ AppointmentSummary.tsx       Card de resumo/confirmação do agendamento
```

## Fluxo de uma mensagem

1. Gerente digita e envia texto na tela `app/gerente/assistente.tsx`.
2. `useAssistente.enviarMensagem` adiciona a mensagem à UI e ao histórico interno (`historicoRef`), então chama `rodarConversa`.
3. `rodarConversa` roda um loop de até `MAX_ITERACOES_POR_MENSAGEM` (4) iterações:
   - Envia o histórico completo para o backend via `assistenteService.enviarMensagem` (`POST /assistente/mensagens`, timeout de 30s — maior que o padrão de 10s do `ApiService`, pois uma chamada ao Gemini com tool-calling pode levar ~11s).
   - O backend responde com `{ texto, chamadasFuncao[] }` — texto livre e/ou chamadas de função que o modelo decidiu fazer.
   - Se houver texto, é exibido na UI.
   - Se houver `chamadasFuncao`, cada uma é executada **localmente no app** por `executarFuncao`, e o resultado é devolvido ao histórico como `respostaFuncao`, reiniciando o loop (o modelo vê o resultado e decide o próximo passo).
   - Se não houver chamadas de função, o loop termina (turno do modelo concluído).
4. Se o loop atingir o limite de iterações sem uma resposta final em texto, uma mensagem de fallback é exibida para evitar loop infinito de tool-calling.

### Por que as tools rodam no client?

As ferramentas (`buscarServicos`, `buscarVeiculos`, `buscarHorariosDisponiveis`, `criarAgendamento`) chamam os **mesmos services de gestão já usados pelo restante da área do gerente** (`servicosService`, `veiculoService.buscarTodos`, `ordemServicoService.criarOrdemServicoGestao` — os mesmos usados em `ModalCriarOrdem`/`useOrdensServicoGerente`), com o token de autenticação do gerente já embutido pelo interceptor do `ApiService`. O backend de IA funciona apenas como **proxy autenticado para o modelo** (ex.: Gemini) — ele não tem acesso direto aos dados de negócio, apenas decide quais ferramentas chamar e com quais argumentos, delegando a execução real ao app.

> **Atenção:** os nomes e argumentos das ferramentas (`buscarServicos`, `buscarVeiculos`, `buscarHorariosDisponiveis`, `criarAgendamento`) precisam bater exatamente com a declaração de function-calling configurada no backend de IA (repositório `RickEsteticaAutomotiva`, módulo `api-agendamento-serviços`, classe `CatalogoFerramentasAssistente` + `prompts/assistente-system-instruction.txt`) — quem decide *quando* e *com quais argumentos* chamar cada tool é o modelo, guiado por essa declaração. Renomear/alterar uma tool aqui sem atualizar o backend quebra o fluxo. Além disso, `AssistenteController` (backend) e `VeiculoController#buscarTodos` precisam permitir o role `GERENTE` — sem isso a busca de veículos do assistente (e do modal manual de criar ordem) retorna 403 para quem só tem esse role.

## Protocolo de mensagens (formato "wire")

O histórico trocado com o backend usa uma estrutura própria, independente do formato nativo do provedor de IA (para desacoplar o app do modelo usado):

```ts
type MensagemWire = {
  papel: 'usuario' | 'modelo';
  partes: ParteWire[];
};

type ParteWire = {
  texto?: string;
  chamadaFuncao?: { nome: string; argumentos: Record<string, any> };
  respostaFuncao?: { nome: string; resposta: Record<string, any> };
};
```

- Mensagens do usuário têm `papel: 'usuario'` com uma parte de `texto`, ou (após uma chamada de função) partes de `respostaFuncao`.
- Mensagens do modelo têm `papel: 'modelo'`, podendo conter `texto` e/ou `chamadaFuncao`.

## Ferramentas disponíveis ao modelo

Implementadas em `executarFuncao` (`hooks/useAssistente.ts`):

| Ferramenta | Argumentos | O que faz | Retorno |
|---|---|---|---|
| `buscarServicos` | `termo` | Pesquisa serviços via `servicosService.pesquisar`. Resultado fica em cache local (`ultimosServicosRef`) para uso posterior. | `{ resultados: [{ id, nome, preco }] }` |
| `buscarVeiculos` | `termo` | Busca veículos de **qualquer cliente** (por placa, marca ou modelo) via `veiculoService.buscarTodos({ filtro: termo })` — a mesma busca de gestão usada em `ModalCriarOrdem`. Não fica restrita a um usuário: o gerente identifica o veículo do cliente que está atendendo, não o seu próprio. | `{ resultados: [{ id, marca, modelo, placa, cor }] }` |
| `buscarHorariosDisponiveis` | `data`, `servicosIds[]` | Consulta horários livres via `ordemServicoService.buscarHorariosDisponiveis`. | `{ resultados: [{ inicio, fim }] }` |
| `criarAgendamento` | `servicoId`, `veiculoId`, `data`, `horario`, `precoMinimo` | **Não cria o agendamento de fato.** Monta um resumo (`ResumoAgendamentoPendente`) usando os dados já cacheados das buscas anteriores e o expõe via estado `resumoPendente`, para a UI renderizar o `AppointmentSummary`. | `{ status: 'aguardando_confirmacao_usuario' }` |

Qualquer ferramenta não reconhecida retorna `{ erro: 'Ferramenta desconhecida: ...' }`; exceções lançadas durante a execução são capturadas e devolvidas ao modelo como `{ erro: mensagem }`, para que ele possa reagir (ex.: pedir os dados de novo) em vez de quebrar a conversa.

## Confirmação do agendamento

O `criarAgendamento` (tool) **não** chama a API real — ele só popula `resumoPendente`. A criação de fato só acontece quando o gerente toca em "Confirmar" no card `AppointmentSummary`, disparando `confirmarAgendamento`, que usa o endpoint de gestão (o mesmo que o restante da área do gerente usa para criar ordens em nome de clientes):

```ts
await ordemServicoService.criarOrdemServicoGestao({
  dataAgendamento: `${data}T${horario}:00`,
  servicos: [servicoId],
  veiculo: veiculoId,
  precoMinimo: precoServico,
});
```

- Em caso de sucesso: mensagem de confirmação é adicionada ao chat e `resumoPendente` é limpo.
- Em caso de erro: a mensagem de erro é exibida dentro do próprio card (`erroConfirmacao`), permitindo tentar novamente sem perder o contexto.
- Botão "Alterar" (`cancelarResumo`) descarta o resumo pendente sem criar nada, permitindo o gerente continuar a conversa para ajustar algo.

## Componentes de UI

- **`UserMessage`** — bolha vermelha alinhada à direita.
- **`AssistantMessage`** — bolha branca alinhada à esquerda, com ícone de "sparkles"; quando `erro=true`, muda para tons vermelhos/ícone de alerta.
- **`AssistantTypingIndicator`** — mesma bolha da IA com texto "digitando…", exibida enquanto `enviando === true`.
- **`AppointmentSummary`** — card com ícones (veículo, serviço, data, horário, preço), botão "Confirmar agendamento" (com loading) e botão "Alterar".

A tela usa `ScrollView` com `onContentSizeChange` para auto-scroll até o fim a cada nova mensagem, e `KeyboardAvoidingView` para não sobrepor o teclado no input.

## Entrada por voz (não implementada)

`hooks/useVoiceInput.ts` já expõe a interface (`suportado`, `gravando`, `iniciar`, `parar`) que uma implementação real usaria, mas retorna `suportado: false` e no-ops. O botão de microfone na tela existe visualmente (com opacidade reduzida) e, ao ser tocado, mostra um `Alert` explicando que reconhecimento de voz exige módulos nativos (`@react-native-voice/voice`, `expo-speech-recognition`, etc.) que requerem um dev client / build EAS — não funcionam no Expo Go puro usado atualmente no desenvolvimento.

## Integração com o resto do app

- **Rota**: `app/gerente/assistente.tsx`, registrada como tab oculta (`href: null`, `headerTitle: 'Assistente Rick'`) em `app/gerente/_layout.tsx`. Fica dentro da área do gerente, cujo acesso já exige login e papel `ROLE_GERENTE` (ver `ROTAS_PROTEGIDAS`/`useProtecaoDeRotas` em `app/_layout.tsx`).
- **Entrada**: item "Assistente IA" na tela "Mais" do gerente (`app/gerente/mais.tsx`), navegando via `router.push('/gerente/assistente')`.

## Backend

O app conversa com o backend em `POST /assistente/mensagens` (via `AssistenteService`), enviando o histórico completo da conversa a cada turno e recebendo `{ texto, chamadasFuncao }`. A lógica do modelo de IA (prompt de sistema, qual provedor/modelo é usado, ex. Gemini) vive no backend, fora deste repositório mobile — este documento cobre apenas a integração do lado do app.

## Limitações conhecidas / pontos de atenção

- **Loop de iterações**: limitado a 4 idas e voltas por mensagem do gerente para evitar loop infinito caso o modelo insista em chamar ferramentas sem nunca responder em texto.
- **Identificação do cliente**: o resumo (`AppointmentSummary`) identifica o veículo por marca/modelo/placa, não pelo nome do cliente — `Veiculo` (`types/index.ts`) não carrega esse dado hoje. Se o backend passar a retornar o nome do proprietário na busca de veículos, dá para exibi-lo também.
- **Cache de resultados**: `ultimosServicosRef` e `ultimosVeiculosRef` guardam apenas o resultado da *última* busca de cada tipo — se o modelo chamar `criarAgendamento` com um `servicoId`/`veiculoId` que não veio da busca mais recente, o resumo cai no fallback (`'Serviço selecionado'` / `'Veículo selecionado'`) em vez do nome real.
- **Sem streaming**: a resposta do modelo é aguardada por completo (até 30s) antes de atualizar a UI; não há exibição incremental de texto.
- **Sem persistência**: o histórico da conversa (`historicoRef`) vive apenas em memória do componente — sair da tela reinicia a conversa.
