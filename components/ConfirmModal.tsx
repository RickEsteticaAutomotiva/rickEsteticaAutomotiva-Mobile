import { Modal, Pressable, Text, View } from 'react-native';
import { Alerta } from './Alerta';
import { Button } from './Button';

type ConfirmModalProps = {
  visible: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  loading?: boolean;
  erro?: string | null;
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmModal({
  visible,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  loading = false,
  erro = null,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View className="flex-1 items-center justify-center bg-black/50 px-6">
        <View className="w-full rounded-lg bg-white p-5 shadow-md">
          <Text className="text-xl font-bold text-gray-900">{title}</Text>

          <Text className="mt-2 text-base text-gray-600">{message}</Text>

          {erro ? <Alerta tipo="erro" mensagem={erro} className="mt-4" /> : null}

          <View className="mt-5 flex-row gap-3">
            <Pressable
              className="h-14 flex-1 items-center justify-center rounded-lg border border-gray-300 active:opacity-70"
              onPress={onCancel}
              disabled={loading}
            >
              <Text className="text-lg font-semibold text-gray-700">{cancelText}</Text>
            </Pressable>

            <Button
              texto={confirmText}
              onClick={onConfirm}
              loading={loading}
              className="flex-1 bg-red-700"
              textClassName="text-white"
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}
