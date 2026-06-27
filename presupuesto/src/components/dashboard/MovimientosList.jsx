import { useState } from 'react';
import { Plus, FunnelSimple } from '@phosphor-icons/react';
import { Button, EmptyState, ConfirmDialog } from '../ui';
import MovimientoRow from './MovimientoRow';
import { ListChecks } from '@phosphor-icons/react';

export default function MovimientosList({
  movements,
  metodos,
  periodoActual,
  efectivoResuelto,
  filterMetodoId,
  onFilterChange,
  onAdd,
  onEdit,
  onDelete,
  onTogglePagado,
  onOpenConfig,
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

  const filteredMovements = filterMetodoId === 'todos'
    ? movements
    : movements.filter((m) => m.metodo_id === filterMetodoId);

  const ingresos = movements.filter((m) => m.tipo === 'Ingreso');
  const gastosFijos = filteredMovements.filter((m) => m.tipo === 'Gasto' && m.isFijo);
  const gastosDinamicos = filteredMovements.filter((m) => m.tipo === 'Gasto' && !m.isFijo);
  const efectivoInicial = parseFloat(periodoActual?.efectivo_inicial || 0);
  const showEfectivoInicial = efectivoInicial > 0 && (filterMetodoId === 'todos' || !!metodos.find(m => m.id === filterMetodoId)?.es_efectivo);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-gray-800">Movimientos</h2>
        <div className="flex items-center gap-3">
          {efectivoResuelto && (
            <Button size="sm" onClick={onAdd}>
              <Plus size={16} />
              Agregar
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={onOpenConfig}>
            Ajustar periodo
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <FunnelSimple size={16} className="text-gray-400" />
        <select
          value={filterMetodoId}
          onChange={(e) => onFilterChange(e.target.value === 'todos' ? 'todos' : parseInt(e.target.value))}
          className="border border-muted rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
        >
          <option value="todos">Todos los métodos</option>
          {metodos.map((m) => (
            <option key={m.id} value={m.id}>{m.metodo_pago}</option>
          ))}
        </select>
      </div>

      {error && (
        <p className="text-sm text-destructive" role="alert">{error}</p>
      )}

      {movements.length === 0 ? (
        <EmptyState
          icon={ListChecks}
          title="Sin movimientos"
          description="No hay movimientos en este periodo. Agrega tu primer ingreso o gasto."
          action={efectivoResuelto ? (
            <Button size="sm" onClick={onAdd}>
              <Plus size={16} />
              Agregar Movimiento
            </Button>
          ) : undefined}
        />
      ) : (
        <>
          {(ingresos.length > 0 || showEfectivoInicial) && (
            <div>
              <h3 className="text-sm font-semibold text-accent-500 mb-2">
                Ingresos
                <span className="text-sm font-normal text-gray-400 ml-2">
                  (RD$ {(ingresos.reduce((s, m) => s + parseFloat(m.totalRD || 0), 0) + (showEfectivoInicial ? efectivoInicial : 0)).toFixed(2)})
                </span>
              </h3>
              <div className="space-y-2">
                {showEfectivoInicial && (
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between bg-surface-card border border-accent-100 rounded-lg p-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="inline-block w-2 h-2 rounded-full shrink-0 bg-accent-500" />
                      <span className="font-medium text-gray-800">Saldo inicial en efectivo</span>
                      <span className="text-sm text-gray-400 shrink-0">Efectivo</span>
                    </div>
                    <span className="font-medium text-accent-500 text-right tabular-nums">
                      RD$ {efectivoInicial.toFixed(2)}
                    </span>
                  </div>
                )}
                {ingresos.map((mov) => (
                  <MovimientoRow
                    key={mov.id}
                    mov={mov}
                    tipo="ingreso"
                    onEdit={onEdit}
                    onDelete={handleDelete}
                    onTogglePagado={onTogglePagado}
                  />
                ))}
              </div>
            </div>
          )}

          <div>
            <h3 className="text-sm font-semibold text-destructive mb-2">Gastos Fijos</h3>
            {gastosFijos.length === 0 ? (
              <p className="text-gray-400 text-sm py-2">
                {filterMetodoId === 'todos' ? 'No hay gastos fijos registrados.' : 'No hay gastos fijos con este método de pago.'}
              </p>
            ) : (
              <div className="space-y-2">
                {gastosFijos.map((mov) => (
                  <MovimientoRow
                    key={mov.id}
                    mov={mov}
                    tipo="gasto-fijo"
                    onEdit={onEdit}
                    onDelete={handleDelete}
                    onTogglePagado={onTogglePagado}
                  />
                ))}
              </div>
            )}
          </div>

          <div>
            <h3 className="text-sm font-semibold text-warning mb-2">Gastos Variables</h3>
            {gastosDinamicos.length === 0 ? (
              <p className="text-gray-400 text-sm py-2">
                {filterMetodoId === 'todos' ? 'No hay gastos variables registrados.' : 'No hay gastos variables con este método de pago.'}
              </p>
            ) : (
              <div className="space-y-2">
                {gastosDinamicos.map((mov) => (
                  <MovimientoRow
                    key={mov.id}
                    mov={mov}
                    tipo="gasto-variable"
                    onEdit={onEdit}
                    onDelete={handleDelete}
                    onTogglePagado={onTogglePagado}
                  />
                ))}
              </div>
            )}
          </div>
        </>
      )}

      <ConfirmDialog
        open={confirmOpen}
        onConfirm={confirmDelete}
        onCancel={() => { setConfirmOpen(false); setPendingDeleteId(null); }}
        title="¿Borrar este movimiento?"
        description="Se eliminará permanentemente este movimiento del periodo actual."
        confirmText="Borrar"
      />
    </div>
  );
}
