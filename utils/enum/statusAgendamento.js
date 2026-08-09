export const StatusAgendamento = {
  1: { label: 'ANÁLISE', classe: 'inline-flex items-center gap-1 px-3 py-0.5 rounded-full text-xs font-semibold uppercase bg-amber-100 text-amber-800', icon: 'bi bi-hourglass-split' },
  2: { label: 'AGENDA CONFIRMADA', classe: 'inline-flex items-center gap-1 px-3 py-0.5 rounded-full text-xs font-semibold uppercase bg-blue-100 text-blue-800', icon: 'bi bi-check-circle' },
  3: { label: 'EM EXECUÇÃO', classe: 'inline-flex items-center gap-1 px-3 py-0.5 rounded-full text-xs font-semibold uppercase bg-indigo-100 text-indigo-800', icon: 'bi bi-gear' },
  4: { label: 'CANCELADO', classe: 'inline-flex items-center gap-1 px-3 py-0.5 rounded-full text-xs font-semibold uppercase bg-red-100 text-red-600', icon: 'bi bi-x-circle' },
  5: { label: 'CONCLUÍDO', classe: 'inline-flex items-center gap-1 px-3 py-0.5 rounded-full text-xs font-semibold uppercase bg-green-100 text-green-800', icon: 'bi bi-check-circle' }
};

export const tradutorStatus = (status) => {
  return StatusAgendamento[status] || { 
    label: 'Status Desconhecido', 
    classe: 'inline-flex items-center gap-1 px-3 py-0.5 rounded-full text-xs font-semibold uppercase bg-gray-100 text-gray-500',
    icon: 'bi bi-question-circle'
  };
};