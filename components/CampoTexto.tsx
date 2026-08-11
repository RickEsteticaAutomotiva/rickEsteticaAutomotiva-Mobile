import { Text } from 'react-native';
import { Input, InputProps } from './Input';

type CampoTextoProps = InputProps & {
  label: string;
  semMargemSuperior?: boolean;
};

export function CampoTexto({ label, semMargemSuperior = false, ...inputProps }: CampoTextoProps) {
  return (
    <>
      <Text className={`mb-2 text-base font-semibold text-gray-900 ${semMargemSuperior ? '' : 'mt-4'}`}>
        {label}
      </Text>
      <Input {...inputProps} />
    </>
  );
}
