import { Pressable, Text, View } from 'react-native';

type TipoAlerta = 'erro' | 'sucesso';

type AlertaProps = {
  tipo?: TipoAlerta;
  mensagem: string;
  className?: string;
  acaoTexto?: string;
  onAcao?: () => void;
};

const ESTILOS: Record<TipoAlerta, { container: string; texto: string }> = {
  erro: { container: 'bg-red-100', texto: 'text-red-700' },
  sucesso: { container: 'bg-green-100', texto: 'text-green-800' },
};

export function Alerta({
  tipo = 'erro',
  mensagem,
  className = 'mb-4',
  acaoTexto,
  onAcao,
}: AlertaProps) {
  const estilo = ESTILOS[tipo];

  return (
    <View className={`rounded-lg p-3 ${estilo.container} ${className}`}>
      <Text className={`text-sm ${estilo.texto}`}>{mensagem}</Text>

      {acaoTexto && onAcao ? (
        <Pressable onPress={onAcao} className="mt-2 self-start">
          <Text className={`text-sm font-semibold ${estilo.texto}`}>{acaoTexto}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}
