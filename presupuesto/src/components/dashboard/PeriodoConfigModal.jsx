import { useState } from 'react';
import { Modal, Button, ConfirmDialog, Input } from '../ui';

export default function PeriodoConfigModal({
  open,
  onClose,
  periodoActual,
  efectivoInput,
  onEfectivoChange,
  onEfectivoSave,
  onLimpiarPeriodo,
}) {
  const [editEfectivo, setEditEfectivo] = useState(false);
  const [confirmLimpiar, setConfirmLimpiar] = useState(false);

  const handleClose = () => {
    setEditEfectivo(false);
    onClose();
  };

  return (
    <>
      <Modal open={open} onClose={handleClose} title="Ajustar Periodo">
        <div className="space-y-6">
          <div>
            <p className="text-sm text-gray-400">Periodo #{periodoActual?.id}</p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-600 mb-2">Efectivo en mano al inicio</h3>
            {editEfectivo ? (
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  step="0.01"
                  value={efectivoInput}
                  onChange={(e) => onEfectivoChange(e.target.value)}
                  autoFocus
                />
                <Button size="sm" onClick={() => { onEfectivoSave(); setEditEfectivo(false); }}>
                  Guardar
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setEditEfectivo(false)}>
                  Cancelar
                </Button>
              </div>
            ) : (
              <div className="flex justify-between items-center">
                <p className="text-xl font-bold text-gray-800 tabular-nums">
                  RD$ {parseFloat(efectivoInput || 0).toFixed(2)}
                </p>
                <Button variant="ghost" size="sm" onClick={() => setEditEfectivo(true)}>
                  Editar
                </Button>
              </div>
            )}
          </div>

          <hr className="border-[#DBEAFE]" />

          <div>
            <h3 className="text-sm font-medium text-destructive mb-2">Zona de Peligro</h3>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setConfirmLimpiar(true)}
            >
              Reiniciar Periodo
            </Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={confirmLimpiar}
        onConfirm={() => {
          setConfirmLimpiar(false);
          onLimpiarPeriodo();
        }}
        onCancel={() => setConfirmLimpiar(false)}
        title="¿Reiniciar este periodo?"
        description="Se borrarán todos los movimientos y el efectivo en mano volverá a 0. Esta acción no se puede deshacer."
        confirmText="Reiniciar"
      />
    </>
  );
}
