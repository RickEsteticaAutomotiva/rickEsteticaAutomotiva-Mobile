# Importação de agendamento via foto (IA)

Documentação da implementação da funcionalidade que permite ao gerente transformar um registro de agendamento feito **fora do sistema** (anotação em papel, bilhete manuscrito, print de conversa de WhatsApp) em uma Ordem de Serviço real, usando o Gemini multimodal para extrair os dados de uma foto. **Feature exclusiva da área do gerente** — não está disponível para o cliente.

Não confundir com o [Assistente de IA](./assistente-ia.md): aquele é um chat em texto onde o gerente conversa com a IA para agendar; este é um fluxo de imagem → extração → revisão → confirmação, sem conversa. As duas features compartilham a integração de baixo nível com o Gemini e a infraestrutura de autenticação/gestão, mas têm regras de negócio e telas totalmente separadas.

## Visão geral

```
Gerente tira foto / seleciona da galeria
   ↓ (base64, no app)
POST /ordem-servicos-gestao/importar-ia   (backend, @GerenteOnly)
   ↓
Gemini multimodal (responseSchema JSON)  →  dados extraídos + confiança por campo
   ↓
Matching com registros reais (Pessoa / Veículo / Serviço já cadastrados)
   ↓
Resposta ao app: campos extraídos + candidatos encontrados
   ↓
Tela de revisão (OBRIGATÓRIA) — gerente confirma ou corrige tudo
   ↓ (dados confirmados, nunca os brutos da IA)
POST /ordem-servicos-gestao   (endpoint já existente, + campo "origem")
   ↓
CriarOrdemServicoUseCase (MESMA regra de negócio de sempre)
   ↓
Banco de dados
```

Regras não-negociáveis que guiaram o design (documento original do produto):

- **Nunca inventar dado.** Campo não identificável com segurança = `null`, nunca um valor chutado. Datas relativas ("sexta às 14h") só são resolvidas com uma data de referência explícita enviada ao Gemini a cada chamada.
- **Revisão sempre obrigatória**, mesmo com confiança 0.99 em todos os campos — a OS nunca é criada automaticamente.
- **Correção manual tem prioridade.** A OS final usa sempre os dados **confirmados/corrigidos** pelo gerente na tela de revisão, nunca os valores brutos que a IA sugeriu.
- **Não inventar cliente/veículo/serviço novo.** O matching só aponta candidatos que já existem no banco; se nada bater, o gerente busca manualmente (reaproveitando os fluxos de busca já existentes) — esta tela não cadastra nada novo.
- **Só o gerente** pode usar — validado no app (rota protegida) **e** no backend (`@GerenteOnly`, não apenas esconder o botão).
- **Chave do Gemini nunca no app** — toda chamada à IA acontece no backend.
- **Imagem nunca é persistida** — trafega em base64 até o Gemini e é descartada; não há storage novo (S3 etc.) para isso.

## Backend (`RickEsteticaAutomotiva/api-agendamento-serviços`)

### Endpoint de extração + matching

`POST /ordem-servicos-gestao/importar-ia` (`ImportacaoAgendamentoController`, `@GerenteOnly`) — **não cria nada**, só extrai e sugere.

Request:

```json
{ "imagemBase64": "/9j/4AAQSkZJRg...", "mimeType": "image/jpeg" }
```

Response (`ImportarAgendamentoResponse`):

```json
{
  "nomeCliente": { "valor": "João Silva", "confianca": 0.86 },
  "telefoneCliente": { "valor": null, "confianca": null },
  "placaVeiculo": { "valor": "ABC1D23", "confianca": 0.95 },
  "modeloVeiculo": { "valor": "Civic", "confianca": 0.7 },
  "descricaoServico": { "valor": "lavagem completa", "confianca": 0.9 },
  "data": { "valor": "2026-09-05", "confianca": 0.82 },
  "horario": { "valor": "14:00:00", "confianca": 0.75 },
  "valor": { "valor": null, "confianca": null },
  "observacoesLivres": "sexta 14h lavagem completa civic joao",
  "candidatosPessoa": [ { "id": 12, "nome": "João Silva", "cpf": "...", "telefone": "..." } ],
  "candidatosVeiculo": [ { "id": 30, "placa": "ABC1D23", "modelo": "Civic", "marca": "Honda", "idPessoa": 12 } ],
  "candidatosServico": [ { "id": 4, "nome": "Lavagem Premium", "preco": 100.00 } ]
}
```

Regras de leitura pelo app:

- `valor: null` = a IA não identificou aquele campo com segurança.
- `candidatosX: []` = nenhum registro real correspondeu — busca manual necessária.
- `candidatosX` com 1 item = apenas uma **sugestão visual**, ainda exige toque explícito do gerente.
- `candidatosX` com mais de 1 item = o gerente escolhe entre os candidatos (chips na tela de revisão).

Erros: `400` (payload inválido), `502` via `IntegracaoException` (Gemini fora do ar, timeout, resposta fora do schema esperado), `403` (usuário autenticado não é `ROLE_GERENTE`).

### Camadas envolvidas

```
application/controller/ImportacaoAgendamentoController.java   Endpoint HTTP, @GerenteOnly
application/service/ImportacaoAgendamentoApplicationService.java   Orquestra extração → matching → assembler
application/assembler/ImportacaoAgendamentoResponseAssembler.java  Domínio → DTO de resposta (reaproveita PessoaDTOMapper/VeiculoDTOMapper/ServicoDTOMapper)

domain/usecase/ExtrairDadosAgendamentoUseCase.java     Chama o gateway de IA com a data de referência (hoje, America/Sao_Paulo)
domain/usecase/BuscarCandidatosAgendamentoUseCase.java Busca candidatos reais via PessoaGateway/VeiculoGateway/ServicoGateway já existentes
domain/gateway/ExtratorAgendamentoGateway.java          Porta (interface) de domínio para o provedor de IA multimodal
domain/entity/DadosAgendamentoExtraido.java             Dados extraídos (todos os campos são CampoExtraido<T>)
domain/entity/CampoExtraido.java                        { valor, confianca } — valor null é sempre um resultado válido
domain/entity/CandidatosAgendamento.java                Listas de Pessoa/Veiculo/Servico candidatos

infrastructure/gateway/GeminiExtratorAgendamentoGateway.java   Implementação do gateway acima via Gemini (RestClient puro, sem SDK)
infrastructure/repository/veiculo/VeiculoSpecification.java   Busca de veículo por termo livre (placa/modelo/marca/nome do dono)
resources/prompts/extracao-agendamento-system-instruction.txt Prompt de extração
```

### Por que um gateway de IA separado do Assistente?

O `AiAssistantGateway`/`GeminiAssistantGateway` já existentes (usados pelo [Assistente de IA](./assistente-ia.md)) são modelados para **chat com histórico e tool-calling** (`enviarMensagem(List<MensagemAssistente>)`). A extração de imagem é **single-shot e multimodal** (texto + imagem), usando o modo JSON estruturado do Gemini (`generationConfig.responseSchema`) — um contrato de payload totalmente diferente. Por isso existe uma porta nova, `ExtratorAgendamentoGateway`, com uma implementação própria (`GeminiExtratorAgendamentoGateway`) que reaproveita apenas a configuração de baixo nível (`GeminiProperties` — mesma API key/model/baseUrl) e o padrão de tratamento de erro (`IntegracaoException`).

O payload enviado ao Gemini tem uma parte de texto (com a data de referência) e uma parte `inlineData` com a imagem em base64:

```json
{
  "contents": [{
    "role": "user",
    "parts": [
      { "text": "Contexto: a data de referência é 2026-08-31..." },
      { "inlineData": { "mimeType": "image/jpeg", "data": "<base64>" } }
    ]
  }],
  "systemInstruction": { "parts": [{ "text": "<prompt de extração>" }] },
  "generationConfig": {
    "responseMimeType": "application/json",
    "responseSchema": { "type": "OBJECT", "properties": { "...": "..." } }
  }
}
```

O `responseSchema` é montado programaticamente (`GeminiExtratorAgendamentoGateway.montarResponseSchema()`) — cada campo é um objeto `{ valor, confianca }` com `nullable: true`, o que é o mecanismo técnico que garante a regra "nunca inventar dado": o próprio contrato de schema permite (e o prompt instrui) o Gemini a devolver `null` quando não tiver certeza, em vez de forçar um palpite.

### Matching

`BuscarCandidatosAgendamentoUseCase` só busca o que a IA conseguiu extrair (campo `null` = nenhuma busca é feita para aquele dado):

| Campo extraído | Busca | Gateway/reaproveitamento |
|---|---|---|
| `nomeCliente` | `PessoaGateway.buscarTodos(nome, pageable)` | Mesma busca do `PessoaController`/`ListarPessoasUseCase` já existentes |
| `placaVeiculo` (preferencial) ou `modeloVeiculo` | `VeiculoGateway.buscarPorTermo(termo)` | Novo (`VeiculoSpecification.filtroUnico`, clona o padrão de `PessoaSpecification`/`ServicoSpecification`) |
| `descricaoServico` | `ServicoGateway.buscarTodos(termo, pageable)` | Mesma busca do `ServicoController`/`ListarServicosUseCase` já existentes |

Nenhum dado novo é criado durante o matching — só leitura.

### Busca de Pessoa para o gerente

O endpoint `GET /pessoas` original é `@ClienteOnly` — o gerente não tinha acesso a ele. Em vez de relaxar a permissão desse endpoint (o que expandiria a superfície de acesso de uma rota já existente para todo cliente cadastrado), foi criado `GET /pessoas-gestao` (`PessoaGestaoController`, `@GerenteOnly`), que reaproveita 100% a mesma lógica (`PessoaApplicationService.buscarTodos` → `ListarPessoasUseCase` → `PessoaSpecification.filtroUnico`) por trás de uma porta de entrada HTTP diferente. `GET /pessoas` continua intocado.

### Campo `origem` na Ordem de Serviço

Para rastrear que uma OS foi criada por esta feature, foi adicionado um campo `origem` (`MANUAL` | `IMPORTACAO_IA`), de forma **aditiva** — sem quebrar os dois fluxos de criação existentes:

- **Migration** `db/migration/V7__ordem_servico_origem.sql`: `ALTER TABLE ordem_servico ADD COLUMN origem VARCHAR(20) NOT NULL DEFAULT 'MANUAL'`.
- **Domínio**: `OrigemOrdemServico` (enum) + `OrdemServico.origem` (`@Builder.Default = MANUAL`).
- **Persistência**: `OrdemServicoEntity.origem` (`@Enumerated(STRING)`, `@Builder.Default = MANUAL` — necessário também aqui, não só no domínio, porque testes de repositório montam a entity diretamente via builder).
- **`CriarOrdemServicoUseCase`**: ganhou uma **sobrecarga** `execute(..., OrigemOrdemServico origem)`; a assinatura antiga (`execute(...)` sem origem) passou a delegar para a nova com `null` → `MANUAL`. Todos os call sites e testes existentes continuam funcionando sem alteração.
- **`OrdemServicoRequest`**: novo campo opcional `origem` (String — parse tolerante em `OrdemServicoApplicationService.criarParaGestao`: valor ausente/inválido vira `MANUAL`).
- **Respostas**: `OrdemServicoDetalheResponse`/`OrdemServicoResumoResponse` agora expõem `origem`, para o app poder exibir "Importado via IA" na listagem/detalhe.

### Contrato de confirmação (criação real da OS)

**Não existe um segundo endpoint para confirmar.** A tela de revisão, ao confirmar, chama exatamente o endpoint que já existia:

`POST /ordem-servicos-gestao` — único acréscimo é o campo opcional `origem`:

```json
{
  "dataAgendamento": "2026-09-05T14:00:00",
  "servicos": [4],
  "precoMinimo": 100.00,
  "veiculo": 30,
  "observacoes": "Importado via foto (revisado pelo gerente)",
  "origem": "IMPORTACAO_IA"
}
```

Todos os valores desse payload são os que o gerente **confirmou/corrigiu na revisão** — nunca os brutos do Gemini. Isso é o que garante, na prática, a regra "correção manual tem prioridade": não existe caminho no código que envie o dado extraído diretamente para a criação da OS sem passar pelo estado editável da tela de revisão.

## Mobile (`rickEsteticaAutomotiva-Mobile`)

### Arquitetura de telas

```
app/gerente/mais.tsx                          Entrada "Importar agendamento" (topo da lista)
app/gerente/importar-agendamento/
  ├─ _layout.tsx     Stack + ImportacaoAgendamentoProvider (contexto compartilhado entre as 2 telas)
  ├─ index.tsx        Tela 1: captura (câmera/galeria) + botão "Processar"
  └─ revisao.tsx       Tela 2: revisão OBRIGATÓRIA — nunca é pulada
       ├─ hooks/useImportacaoAgendamento.tsx   Estado + orquestração (Context)
       │    ├─ services/ImportacaoAgendamentoService.jsx   POST /ordem-servicos-gestao/importar-ia
       │    ├─ services/PessoaGestaoService.jsx             GET /pessoas-gestao (busca manual de cliente)
       │    ├─ services/VeiculoService.jsx                  buscarTodos/buscarVeiculosPorUsuario (busca manual de veículo)
       │    ├─ services/ServicosService.jsx                 pesquisar (busca manual de serviço no catálogo)
       │    └─ services/OrdemServicoService.jsx              criarOrdemServicoGestao (criação real — mesmo método usado por ModalCriarOrdem e pelo Assistente)
       └─ components/ (reaproveitados): CampoTexto, Alerta, Button, EstadoCarregamento, EstadoErro, ConfirmModal
```

`expo-image-picker` (`~17.0.11`) foi instalado especificamente para esta feature — não havia nenhuma dependência de câmera/galeria no projeto antes.

### `useImportacaoAgendamento` (hook + Context)

Como a captura (tela 1) e a revisão (tela 2) são rotas separadas do Expo Router, o estado é compartilhado via um `Context` criado pelo próprio hook (`ImportacaoAgendamentoProvider`, montado em `app/gerente/importar-agendamento/_layout.tsx`) — assim as duas telas usam a mesma instância de estado durante a navegação entre elas.

Principais responsabilidades:

| Função | O que faz |
|---|---|
| `capturarImagem('camera' \| 'galeria')` | Pede permissão (`ImagePicker.requestCameraPermissionsAsync`/`requestMediaLibraryPermissionsAsync`), abre o picker com `base64: true`, guarda `{ uri, base64, mimeType }`. |
| `processarImagem()` | Chama `importacaoAgendamentoService.extrair` (timeout de 30s, mesmo padrão do `AssistenteService`), normaliza a resposta e pré-preenche os campos de texto editáveis (data/hora/valor/observações) — **nunca** pré-seleciona um cliente/veículo/serviço automaticamente, mesmo quando há só 1 candidato. |
| `buscarClientes/buscarVeiculos/buscarServicosCatalogo(termo)` | Busca manual, usada quando os candidatos vindos da IA são insuficientes ou vazios. |
| `buscarVeiculosDoCliente(clienteId)` | Ao selecionar um cliente candidato, busca os veículos **daquele** cliente (`veiculoService.buscarVeiculosPorUsuario`) para facilitar achar o veículo certo. |
| `alternarServico(id)` / `selecionarCliente(id)` / `selecionarVeiculo(id)` | Seleção explícita — sempre um toque do gerente, nunca automático. |
| `confirmarCriacaoOS()` | Valida (veículo + ≥1 serviço + data + horário), monta o payload com os **valores atuais do formulário** (não os brutos da IA) e chama `ordemServicoService.criarOrdemServicoGestao({ ...formulário, origem: 'IMPORTACAO_IA' })`. |

### Tela de revisão (`revisao.tsx`)

Para cada campo extraído, mostra: valor sugerido + **selo de confiança** (verde "Alta confiança" ≥0.85, amarelo "Confirme este dado" ≥0.6, amarelo "Baixa confiança" abaixo disso, cinza "Não identificado" quando `null`) + campo de texto editável. Cliente/veículo/serviço usam chips de seleção (mesmo padrão visual de `ModalCriarOrdem.tsx`) com busca manual embutida quando não há candidato bom o bastante. Serviço nunca tem opção de "criar novo" — só é possível selecionar algo do catálogo real.

Botão "Confirmar e criar OS" só habilita depois de veículo + ≥1 serviço + data + horário preenchidos; botão "Cancelar" (com `ConfirmModal` de confirmação) descarta tudo sem criar nada — a imagem já nunca foi salva em lugar nenhum, então cancelar não deixa rastro.

Tela de sucesso (após `POST /ordem-servicos-gestao` responder OK) mostra cliente, veículo, serviço(s), data e número da OS, com botão para ir à listagem de Ordens de Serviço.

### Indicação visual de origem

`OrdemServicoListItem.tsx` (usado na listagem `app/gerente/ordens-servico.tsx`) exibe um badge "Importado via IA" quando `ordem.origem === 'IMPORTACAO_IA'` — o campo é capturado em `utils/normalizacao.ts` (`normalizarOrdemServico`) a partir da resposta do backend.

## Segurança

- **Chave do Gemini**: só existe no backend, via `GEMINI_API_KEY` (env var → `.env.local` em dev, AWS SSM Parameter Store em prod) — nunca chega ao app.
- **Autorização em camada dupla**: os dois endpoints novos (`/ordem-servicos-gestao/importar-ia`, `/pessoas-gestao`) são `@GerenteOnly` no backend (Spring Security `@PreAuthorize`), então mesmo que alguém chame a API diretamente sem passar pelo app, um usuário sem o role `ROLE_GERENTE` recebe `403`. A rota no app também é protegida (`app/_layout.tsx`, `hasRole('ROLE_GERENTE')`), mas essa é só a segunda camada, não a única.
- **Imagem**: nunca persistida — só trafega em memória do app até a chamada ao Gemini no backend, depois é descartada.
- **Nenhuma criação automática**: em nenhum ponto do código a resposta da extração alimenta diretamente a criação de uma OS; sempre passa pelo estado editável da tela de revisão e por um toque explícito de confirmação.

## Como testar localmente

1. Backend: garanta `GEMINI_API_KEY` válida em `.env.local`, suba com `./mvnw spring-boot:run` (a migration `V7` roda automaticamente via Flyway).
2. Mobile: `npx expo start`, logue como um usuário com role `ROLE_GERENTE`.
3. Vá em **Mais → Importar agendamento** (primeiro item da lista).
4. Cenários a cobrir (do documento de produto original):
   - Imagem nítida com todos os dados presentes e correspondência única em cada campo.
   - Imagem manuscrita/ambígua — confira os selos de confiança.
   - Serviço fora do catálogo — não deve haver opção de criar um novo, só buscar entre os existentes.
   - Veículo/cliente inexistente — busca manual deve funcionar.
   - Múltiplos candidatos de cliente/veículo — nenhum deve vir pré-selecionado.
   - Corrigir manualmente um campo sugerido e confirmar — a OS criada deve refletir o valor **corrigido**, não o original da IA (conferir via `GET /ordem-servicos-gestao/{id}`).
   - Cancelar a importação em qualquer ponto — nenhuma OS deve ser criada.
   - Simular falha do Gemini (ex.: `GEMINI_BASE_URL` inválida) — deve aparecer erro tratado, com opção de tentar novamente, sem crash.

## Arquivos

**Backend — novos**: `domain/enums/OrigemOrdemServico.java`, `domain/entity/{CampoExtraido,DadosAgendamentoExtraido,CandidatosAgendamento}.java`, `domain/gateway/ExtratorAgendamentoGateway.java`, `domain/usecase/{ExtrairDadosAgendamentoUseCase,BuscarCandidatosAgendamentoUseCase}.java`, `infrastructure/gateway/GeminiExtratorAgendamentoGateway.java`, `infrastructure/repository/veiculo/VeiculoSpecification.java`, `application/controller/{ImportacaoAgendamentoController,PessoaGestaoController}.java`, `application/service/ImportacaoAgendamentoApplicationService.java`, `application/assembler/ImportacaoAgendamentoResponseAssembler.java`, `application/dto/request/ExtrairAgendamentoRequest.java`, `application/dto/response/{CampoExtraidoResponse,ImportarAgendamentoResponse}.java`, `db/migration/V7__ordem_servico_origem.sql`, `resources/prompts/extracao-agendamento-system-instruction.txt`.

**Backend — alterados**: `CriarOrdemServicoUseCase`, `OrdemServico`, `OrdemServicoEntity`, `OrdemServicoRequest`, `OrdemServicoApplicationService`, `OrdemServicoResponseAssembler`, `OrdemServicoDetalheResponse`, `OrdemServicoResumoResponse`, `VeiculoGateway`, `VeiculoGatewayImpl`, `VeiculoRepository`.

**Mobile — novos**: `services/{ImportacaoAgendamentoService,PessoaGestaoService}.jsx`, `hooks/useImportacaoAgendamento.tsx`, `app/gerente/importar-agendamento/{_layout,index,revisao}.tsx`.

**Mobile — alterados**: `app/gerente/_layout.tsx`, `app/gerente/mais.tsx`, `services/OrdemServicoService.jsx`, `types/index.ts`, `utils/normalizacao.ts`, `components/gerente/OrdemServicoListItem.tsx`, `app.json`, `package.json`.
