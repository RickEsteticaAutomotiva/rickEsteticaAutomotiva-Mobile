import { Text, View } from 'react-native';
import { obterIdStatusPorNome, obterStatusPorId, STATUS_ORDEM_SERVICO } from '../../constants/statusOrdemServico';
import type { StatusOrdemServico } from '../../types';

export function StatusPill({ status }: { status: StatusOrdemServico }) {
  const opcao =
    obterStatusPorId(status.id ?? undefined) ??
    obterStatusPorId(obterIdStatusPorNome(status.nome) ?? undefined) ??
    STATUS_ORDEM_SERVICO[0];

  return (
    <View
      className="self-start rounded-full px-3 py-1"
      style={{ backgroundColor: opcao?.corFundo ?? '#F3F4F6' }}
    >
      <Text
        className="text-xs font-semibold uppercase"
        style={{ color: opcao?.corTexto ?? '#374151' }}
      >
        {status.nome || opcao?.label || 'Status desconhecido'}
      </Text>
    </View>
  );
}
