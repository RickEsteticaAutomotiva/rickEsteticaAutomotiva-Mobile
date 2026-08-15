import { Text, View } from 'react-native';

type StatusBadgeProps = {
  status: string;
};

const CORES: Record<string, { fundo: string; texto: string }> = {
  'ANÁLISE': { fundo: '#FEF3C7', texto: '#92400E' },
  'AGENDA CONFIRMADA': { fundo: '#DBEAFE', texto: '#1E40AF' },
  'EM EXECUÇÃO': { fundo: '#EDE9FE', texto: '#5B21B6' },
  CANCELADO: { fundo: '#FEE2E2', texto: '#B91C1C' },
  'CONCLUÍDO': { fundo: '#DCFCE7', texto: '#166534' },
};

const COR_PADRAO = { fundo: '#F3F4F6', texto: '#374151' };

export function StatusBadge({ status }: StatusBadgeProps) {
  const cor = CORES[status.toUpperCase()] ?? COR_PADRAO;

  return (
    <View
      style={{ backgroundColor: cor.fundo }}
      className="self-start rounded-full px-3 py-1"
    >
      <Text style={{ color: cor.texto }} className="text-xs font-semibold uppercase">
        {status}
      </Text>
    </View>
  );
}
