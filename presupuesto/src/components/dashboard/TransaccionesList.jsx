import { useState } from 'react';
import { Plus, PencilSimple, Trash, ArrowsDownUp } from '@phosphor-icons/react';
import { Button, Badge, EmptyState, ConfirmDialog } from '../ui';

export default function TransaccionesList({
  transacciones,
  efectivoResuelto,
  onAdd,
  onEdit,
  onDelete,
  error,
}) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState(null);

  const handleDelete = (id) => {
    setPendingDeleteId(id);
    setConfirmOpen(true);
  };

  const confirmDelete = () => {
    if (pendingDeleteId != null) {
      onDelete(pendingDeleteId);
    }
    setConfirmOpen(false);
    setPendingDeleteId(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-gray-800">Depósitos y Retiros</h2>
        {efectivoResuelto && (
          <Button size="sm" variant="outline" onClick={onAdd}>
            <Plus size={16} />
            Agregar
          </Button>
        )}
      </div>

      {error && (
        <p className="text-sm text-destructive" role="alert">{error}</p>
      )}

      {transacciones.length === 0 ? (
        <EmptyState
          icon={ArrowsDownUp}
          title="Sin transacciones"
          description="No hay depósitos o retiros en este periodo."
          className="py-8"
        />
      ) : (
        <div className="space-y-2">
          {transacciones.map((t) => (
            <div
              key={t.id}
              className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between bg-surface-card border border-[#DBEAFE] rounded-lg p-3 hover:bg-primary-50/30 transition-colors duration-150"
            >
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 min-w-0">
                <span
                  className={`inline-block w-2 h-2 rounded-full shrink-0 ${
                    t.tipo === 'deposito' ? 'bg-primary-500' : 'bg-accent-500'
                  }`}
                />
                <span className="font-medium text-gray-800 truncate">{t.descripcion || 'Sin descripción'}</span>
                <Badge variant={t.tipo === 'deposito' ? 'info' : 'success'}>
                  {t.tipo === 'deposito' ? 'Depósito → Banco' : 'Retiro → Efectivo'}
                </Badge>
              </div>
              <div className="flex items-center justify-end gap-2 shrink-0 sm:ml-3">
                <span className="font-medium text-gray-700 tabular-nums">
                  RD$ {parseFloat(t.monto).toFixed(2)}
                </span>
                <button
                  onClick={() => onEdit(t)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-primary hover:bg-primary-50 transition-colors cursor-pointer"
                  aria-label="Editar transacción"
                >
                  <PencilSimple size={16} />
                </button>
                <button
                  onClick={() => handleDelete(t.id)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-destructive hover:bg-destructive-50 transition-colors cursor-pointer"
                  aria-label="Borrar transacción"
                >
                  <Trash size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={confirmOpen}
        onConfirm={confirmDelete}
        onCancel={() => { setConfirmOpen(false); setPendingDeleteId(null); }}
        title="¿Borrar esta transacción?"
        description="Se eliminará permanentemente esta transacción del periodo actual."
        confirmText="Borrar"
      />
    </div>
  );
}
