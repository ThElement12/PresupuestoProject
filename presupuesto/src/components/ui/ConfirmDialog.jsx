import { WarningCircle } from '@phosphor-icons/react';
import Modal from './Modal';
import Button from './Button';

export default function ConfirmDialog({
  open,
  onConfirm,
  onCancel,
  title = '¿Estás seguro?',
  description = 'Esta acción no se puede deshacer.',
  confirmText = 'Confirmar',
  loading = false,
}) {
  return (
    <Modal open={open} onClose={onCancel}>
      <div className="flex flex-col items-center text-center">
        <div className="w-12 h-12 rounded-full bg-destructive-50 flex items-center justify-center mb-4">
          <WarningCircle size={28} className="text-destructive" weight="fill" />
        </div>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">{title}</h3>
        <p className="text-sm text-gray-500 mb-6">{description}</p>
        <div className="flex gap-3 w-full">
          <Button
            variant="secondary"
            className="flex-1"
            onClick={onCancel}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            variant="destructive"
            className="flex-1"
            onClick={onConfirm}
            loading={loading}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
