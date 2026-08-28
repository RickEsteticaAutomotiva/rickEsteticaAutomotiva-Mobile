export type StatusOption = {
  id: number;
  label: string;
  corFundo: string;
  corTexto: string;
};

// ids/labels espelham a tabela `status` do backend (seed) — usados tanto para
// exibir o status atual quanto para o seletor de troca de status.
export const STATUS_ORDEM_SERVICO: StatusOption[] = [
  { id: 1, label: 'Análise', corFundo: '#FEF3C7', corTexto: '#92400E' },
  { id: 2, label: 'Agenda confirmada', corFundo: '#DBEAFE', corTexto: '#1E40AF' },
  { id: 3, label: 'Em execução', corFundo: '#E0E7FF', corTexto: '#3730A3' },
  { id: 4, label: 'Cancelado', corFundo: '#FEE2E2', corTexto: '#B91C1C' },
  { id: 5, label: 'Concluído', corFundo: '#DCFCE7', corTexto: '#166534' },
];

const LABEL_POR_DESCRICAO: Record<string, number> = {
  'ANÁLISE': 1,
  ANALISE: 1,
  'AGENDA CONFIRMADA': 2,
  'EM EXECUÇÃO': 3,
  'EM EXECUCAO': 3,
  CANCELADO: 4,
  'CONCLUÍDO': 5,
  CONCLUIDO: 5,
};

export const STATUS_CANCELADO = 4;
export const STATUS_CONCLUIDO = 5;

export function obterStatusPorId(id: number | null | undefined): StatusOption | undefined {
  return STATUS_ORDEM_SERVICO.find((status) => status.id === id);
}

// Fallback para quando só temos o nome/descrição do status (ex: endpoint
// "agendamentos de hoje", que retorna o status como string solta).
export function obterIdStatusPorNome(nome: string | null | undefined): number | null {
  if (!nome) {
    return null;
  }
  return LABEL_POR_DESCRICAO[nome.trim().toUpperCase()] ?? null;
}

export type MotivoOption = { id: number; label: string };

// Reflete exatamente as 3 linhas da tabela `motivo` no backend — não incluir
// mais opções aqui sem confirmar que existem no banco (a request de
// cancelamento exige um motivoId válido).
export const MOTIVOS_CANCELAMENTO: MotivoOption[] = [
  { id: 1, label: 'Desistência' },
  { id: 2, label: 'Problema técnico' },
  { id: 3, label: 'Reagendamento' },
];
