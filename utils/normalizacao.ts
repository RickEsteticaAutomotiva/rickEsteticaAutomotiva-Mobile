import { StatusAgendamento } from './enum/statusAgendamento';
import type {
  Categoria,
  Favorito,
  ItemCarrinho,
  ItemOrdemServico,
  OrdemServico,
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

function extrairLista(response: unknown): unknown[] {
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

  return {
    id,
    dataAgendamento: registro.dataAgendamento ? String(registro.dataAgendamento) : undefined,
    status: normalizarStatusOrdemServico(registro),
    veiculo: normalizarVeiculo(registro.veiculo),
    servicos,
    precoTotal,
    observacoes: registro.observacoes ? String(registro.observacoes) : undefined,
    motivoCancelamento: motivoCancelamento ? String(motivoCancelamento) : undefined,
  };
}

export function normalizarOrdensServico(response: unknown): OrdemServico[] {
  return extrairLista(response)
    .map(normalizarOrdemServico)
    .filter((ordem): ordem is OrdemServico => ordem !== null)
    .sort((a, b) => Number(b.id) - Number(a.id));
}
