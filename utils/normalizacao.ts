import { StatusAgendamento } from './enum/statusAgendamento';
import type {
  CampoExtraido,
  Categoria,
  DadosImportacaoAgendamento,
  Favorito,
  FavoritoServico,
  ItemCarrinho,
  ItemOrdemServico,
  OrdemServico,
  Perfil,
  Pessoa,
  Servico,
  Veiculo,
} from '../types';

const STATUS_MAP = StatusAgendamento as Record<number, { label: string }>;

const CHAVES_LISTA = [
  'data',
  'content',
  'categorias',
  'servicos',
  'itens',
  'veiculos',
  'favoritos',
  'ordens',
];

export function extrairLista(response: unknown): unknown[] {
  if (Array.isArray(response)) {
    return response;
  }

  if (response && typeof response === 'object') {
    const payload = response as Record<string, unknown>;
    for (const chave of CHAVES_LISTA) {
      if (Array.isArray(payload[chave])) {
        return payload[chave] as unknown[];
      }
    }
  }

  return [];
}

export function normalizarCategorias(response: unknown): Categoria[] {
  const categorias: Categoria[] = [];

  extrairLista(response).forEach((item, index) => {
    const categoria = item as Record<string, unknown>;
    const nome = String(categoria.nome || categoria.name || '').trim();
    if (!nome) {
      return;
    }

    categorias.push({
      id: (categoria.id as string | number) ?? `categoria-${index}`,
      nome,
      imagem: String(categoria.imagem || categoria.image || ''),
    });
  });

  return categorias;
}

// Backend expõe duração como LocalTime serializado ("HH:mm:ss") no campo
// `duracaoHoras` — convertida aqui para minutos totais, mais fácil de editar
// num campo numérico simples na tela do gerente.
function duracaoHorasParaMinutos(duracaoHoras: unknown): number | undefined {
  if (typeof duracaoHoras !== 'string') {
    return undefined;
  }

  const partes = duracaoHoras.split(':').map(Number);
  if (partes.length < 2 || partes.some(Number.isNaN)) {
    return undefined;
  }

  const [horas, minutos] = partes;
  return horas * 60 + minutos;
}

export function normalizarServicos(response: unknown): Servico[] {
  const servicos: Servico[] = [];

  extrairLista(response).forEach((item, index) => {
    const servico = item as Record<string, unknown>;
    const nome = String(servico.nome || servico.name || '').trim();
    if (!nome) {
      return;
    }

    servicos.push({
      id: (servico.id as string | number) ?? `servico-${index}`,
      nome,
      descricao: String(servico.descricao || servico.description || ''),
      preco: servico.preco as number | string,
      imagem: String(servico.imagem || servico.image || ''),
      categoriaId: servico.categoriaId as string | number | undefined,
      duracaoMinutos: duracaoHorasParaMinutos(servico.duracaoHoras),
    });
  });

  return servicos;
}

export function normalizarCarrinho(response: unknown): ItemCarrinho[] {
  const itens: ItemCarrinho[] = [];

  extrairLista(response).forEach((item) => {
    const registro = item as Record<string, unknown>;
    const idCarrinho = registro.idCarrinho as string | number | undefined;

    if (idCarrinho === undefined || idCarrinho === null) {
      return;
    }

    itens.push({
      idCarrinho,
      idServico: registro.idServico as string | number,
      nome: String(registro.nome || ''),
      descricao: String(registro.descricao || ''),
      preco: registro.preco as number | string,
      imagem: String(registro.imagem || ''),
    });
  });

  return itens;
}

export function normalizarFavoritosServicos(response: unknown): FavoritoServico[] {
  const itens: FavoritoServico[] = [];

  extrairLista(response).forEach((item) => {
    const registro = item as Record<string, unknown>;
    const servico = registro.servico as Record<string, unknown> | undefined;

    const idFavorito = (registro.id ?? registro.idFavorito) as string | number | undefined;
    const idServico = (registro.idServico ?? registro.servicoId ?? servico?.id) as
      | string
      | number
      | undefined;

    if (idFavorito === undefined || idFavorito === null || idServico === undefined || idServico === null) {
      return;
    }

    const nome = String(registro.nome || servico?.nome || servico?.name || '').trim();
    if (!nome) {
      return;
    }

    itens.push({
      idFavorito,
      idServico,
      nome,
      descricao: String(registro.descricao || servico?.descricao || ''),
      preco: (registro.preco ?? servico?.preco) as number | string,
      imagem: String(registro.imagem || servico?.imagem || ''),
    });
  });

  return itens;
}

export function normalizarPerfil(response: unknown): Perfil | null {
  if (!response || typeof response !== 'object') {
    return null;
  }

  const dados = response as Record<string, unknown>;

  if (dados.id === undefined || dados.id === null) {
    return null;
  }

  return {
    id: dados.id as string | number,
    nome: dados.nome ? String(dados.nome) : undefined,
    email: dados.email ? String(dados.email) : undefined,
    telefone: dados.telefone ? String(dados.telefone) : undefined,
    cpf: dados.cpf ? String(dados.cpf) : undefined,
    dataNascimento: dados.dataNascimento ? String(dados.dataNascimento) : undefined,
    roles: Array.isArray(dados.roles) ? dados.roles.map(String) : undefined,
  };
}

export function normalizarVeiculo(item: unknown): Veiculo | null {
  if (!item || typeof item !== 'object') {
    return null;
  }

  const registro = item as Record<string, unknown>;
  const id = registro.id as string | number | undefined;

  if (id === undefined || id === null) {
    return null;
  }

  return {
    id,
    idPessoa: registro.idPessoa as string | number | undefined,
    placa: String(registro.placa || ''),
    modelo: String(registro.modelo || ''),
    marca: String(registro.marca || ''),
    porte: registro.porte ? String(registro.porte) : undefined,
    cor: String(registro.cor || ''),
    ano: String(registro.ano || ''),
  };
}

export function normalizarVeiculos(response: unknown): Veiculo[] {
  return extrairLista(response)
    .map(normalizarVeiculo)
    .filter((veiculo): veiculo is Veiculo => veiculo !== null);
}

export function normalizarFavoritos(response: unknown): Favorito[] {
  const favoritos: Favorito[] = [];

  extrairLista(response).forEach((item) => {
    const registro = item as Record<string, unknown>;
    const servico = registro.servico as Record<string, unknown> | undefined;

    const id = (registro.id ?? registro.idFavorito) as string | number | undefined;
    const idServico = (registro.idServico ?? registro.servicoId ?? servico?.id) as
      | string
      | number
      | undefined;

    if (id === undefined || id === null || idServico === undefined || idServico === null) {
      return;
    }

    favoritos.push({ id, idServico });
  });

  return favoritos;
}

function normalizarStatusOrdemServico(registro: Record<string, unknown>): {
  id: number | null;
  nome: string;
} {
  const statusBruto = registro.status;

  if (statusBruto && typeof statusBruto === 'object') {
    const statusObjeto = statusBruto as Record<string, unknown>;
    const id = typeof statusObjeto.id === 'number' ? statusObjeto.id : Number(statusObjeto.id) || null;
    const nome = String(
      statusObjeto.nome || statusObjeto.descricao || (id !== null ? STATUS_MAP[id]?.label : '') || ''
    );
    return { id, nome };
  }

  if (typeof statusBruto === 'number') {
    return { id: statusBruto, nome: STATUS_MAP[statusBruto]?.label || String(statusBruto) };
  }

  if (typeof statusBruto === 'string') {
    const numerico = Number(statusBruto);
    if (!Number.isNaN(numerico) && STATUS_MAP[numerico]) {
      return { id: numerico, nome: STATUS_MAP[numerico].label };
    }
    return { id: null, nome: statusBruto };
  }

  return { id: null, nome: '' };
}

function normalizarItensOrdemServico(response: unknown): ItemOrdemServico[] {
  const itens: ItemOrdemServico[] = [];

  extrairLista(response).forEach((item, index) => {
    const registro = item as Record<string, unknown>;
    const servicoAninhado = registro.servico as Record<string, unknown> | undefined;

    const nome = String(registro.nome || servicoAninhado?.nome || registro.name || '').trim();
    if (!nome) {
      return;
    }

    const id = (registro.idServico ?? registro.servicoId ?? servicoAninhado?.id ?? registro.id ?? `servico-${index}`) as
      | string
      | number;
    const preco = (registro.valorAplicado ?? registro.preco ?? servicoAninhado?.preco) as
      | number
      | string;

    itens.push({ id, nome, preco });
  });

  return itens;
}

export function normalizarOrdemServico(item: unknown): OrdemServico | null {
  if (!item || typeof item !== 'object') {
    return null;
  }

  const registro = item as Record<string, unknown>;
  const id = registro.id as string | number | undefined;

  if (id === undefined || id === null) {
    return null;
  }

  const servicos = normalizarItensOrdemServico(registro.servicos ?? registro.itensServico ?? []);

  const precoInformado = registro.precoMinimo ?? registro.precoTotal ?? registro.valorTotal ?? registro.total;
  const precoTotal =
    precoInformado !== undefined && precoInformado !== null
      ? Number(precoInformado)
      : servicos.reduce((soma, servico) => soma + (Number(servico.preco) || 0), 0);

  const motivoCancelamento = registro.motivoCancelamento ?? registro.motivo;
  const dataAgendamentoBruta = registro.dataAgendamento ?? registro.dataHora;

  const clienteBruto = registro.cliente as Record<string, unknown> | undefined;
  const cliente =
    clienteBruto && clienteBruto.id !== undefined && clienteBruto.id !== null
      ? {
          id: clienteBruto.id as string | number,
          nome: String(clienteBruto.nome || ''),
          telefone: clienteBruto.telefone ? String(clienteBruto.telefone) : undefined,
        }
      : null;

  return {
    id,
    dataAgendamento: dataAgendamentoBruta ? String(dataAgendamentoBruta) : undefined,
    dataConclusao: registro.dataConclusao ? String(registro.dataConclusao) : undefined,
    status: normalizarStatusOrdemServico(registro),
    cliente,
    veiculo: normalizarVeiculo(registro.veiculo),
    servicos,
    precoTotal,
    observacoes: registro.observacoes ? String(registro.observacoes) : undefined,
    motivoCancelamento: motivoCancelamento ? String(motivoCancelamento) : undefined,
    origem: registro.origem ? String(registro.origem) : undefined,
  };
}

export function normalizarOrdensServico(response: unknown): OrdemServico[] {
  return extrairLista(response)
    .map(normalizarOrdemServico)
    .filter((ordem): ordem is OrdemServico => ordem !== null)
    .sort((a, b) => Number(b.id) - Number(a.id));
}

export function normalizarPessoa(item: unknown): Pessoa | null {
  if (!item || typeof item !== 'object') {
    return null;
  }

  const registro = item as Record<string, unknown>;
  const id = registro.id as string | number | undefined;

  if (id === undefined || id === null) {
    return null;
  }

  return {
    id,
    nome: String(registro.nome || ''),
    cpf: registro.cpf ? String(registro.cpf) : undefined,
    email: registro.email ? String(registro.email) : undefined,
    telefone: registro.telefone ? String(registro.telefone) : undefined,
  };
}

export function normalizarPessoas(response: unknown): Pessoa[] {
  return extrairLista(response)
    .map(normalizarPessoa)
    .filter((pessoa): pessoa is Pessoa => pessoa !== null);
}

function normalizarCampoExtraido<T>(campo: unknown): CampoExtraido<T> {
  if (!campo || typeof campo !== 'object') {
    return { valor: null, confianca: null };
  }
  const registro = campo as Record<string, unknown>;
  return {
    valor: (registro.valor ?? null) as T | null,
    confianca: typeof registro.confianca === 'number' ? registro.confianca : null,
  };
}

export function normalizarImportacaoAgendamento(response: unknown): DadosImportacaoAgendamento {
  const registro = (response && typeof response === 'object' ? response : {}) as Record<string, unknown>;

  return {
    nomeCliente: normalizarCampoExtraido<string>(registro.nomeCliente),
    telefoneCliente: normalizarCampoExtraido<string>(registro.telefoneCliente),
    placaVeiculo: normalizarCampoExtraido<string>(registro.placaVeiculo),
    modeloVeiculo: normalizarCampoExtraido<string>(registro.modeloVeiculo),
    descricaoServico: normalizarCampoExtraido<string>(registro.descricaoServico),
    data: normalizarCampoExtraido<string>(registro.data),
    horario: normalizarCampoExtraido<string>(registro.horario),
    valor: normalizarCampoExtraido<number>(registro.valor),
    observacoesLivres: registro.observacoesLivres ? String(registro.observacoesLivres) : undefined,
    candidatosPessoa: normalizarPessoas({ content: registro.candidatosPessoa }),
    candidatosVeiculo: normalizarVeiculos({ content: registro.candidatosVeiculo }),
    candidatosServico: normalizarServicos({ content: registro.candidatosServico }),
  };
}
