import { PencilSimple, Trash } from '@phosphor-icons/react';
import { Badge } from '../ui';

export default function MovimientoRow({ mov, tipo, onEdit, onDelete, onTogglePagado }) {
  const isIngreso = tipo === 'ingreso';
  const esCashback = !isIngreso && parseFloat(mov.totalRD) < 0;
  const amountColor = isIngreso || esCashback ? 'text-accent-500' : 'text-destructive';

  const diaPago = mov.isFijo && mov.fecha_pago
    ? new Date(String(mov.fecha_pago).substring(0, 10) + 'T00:00:00').getDate()
    : null;

  const fechaRegistro = !mov.isFijo && mov.created_at
    ? new Date(mov.created_at).toLocaleDateString('es-DO', { day: 'numeric', month: 'short' })
    : null;

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between bg-surface-card border border-[#DBEAFE] rounded-lg p-3 hover:bg-primary-50/30 transition-colors duration-150">
      <div className="flex items-center gap-3 min-w-0">
        {!isIngreso && (
          mov.es_efectivo ? (
            <span className="inline-block w-4 h-4 shrink-0" />
          ) : (
            <input
              type="checkbox"
              checked={!!mov.pagado}
              onChange={() => onTogglePagado(mov.id, mov.pagado)}
              className="h-4 w-4 shrink-0 accent-primary cursor-pointer"
            />
          )
        )}
        <span className={`inline-block w-2 h-2 rounded-full shrink-0 ${isIngreso || esCashback ? 'bg-accent-500' : 'bg-destructive'}`} />
        <span className="font-medium text-gray-800 truncate">{mov.descripcion}</span>
        <span className="text-sm text-gray-400 shrink-0">{mov.metodo_pago}</span>
        {diaPago && (
          <span className="text-xs text-primary shrink-0">Cobro el día {diaPago} de c/mes</span>
        )}
        {fechaRegistro && (
          <span className="text-xs text-gray-400 shrink-0">{fechaRegistro}</span>
        )}
      </div>
      <div className="flex items-center justify-end gap-2 shrink-0 sm:ml-3">
        <div className="text-right">
          <span className={`font-medium tabular-nums ${amountColor}`}>
            {esCashback ? '+' : ''}RD$ {Math.abs(parseFloat(mov.totalRD)).toFixed(2)}
          </span>
          {parseFloat(mov.monto_usd) > 0 && (
            <span className="block text-xs text-gray-400 tabular-nums">
              US$ {parseFloat(mov.monto_usd).toFixed(2)}
            </span>
          )}
        </div>
        {esCashback && <Badge variant="success">Cashback</Badge>}
        {!isIngreso && (
          <Badge variant={mov.pagado || mov.es_efectivo ? 'success' : 'warning'}>
            {mov.pagado || mov.es_efectivo ? 'Pagado' : 'Pendiente'}
          </Badge>
        )}
        <button
          onClick={() => onEdit(mov)}
          className="p-1.5 rounded-lg text-gray-400 hover:text-primary hover:bg-primary-50 transition-colors cursor-pointer"
          aria-label="Editar movimiento"
        >
          <PencilSimple size={16} />
        </button>
        <button
          onClick={() => onDelete(mov.id)}
          className="p-1.5 rounded-lg text-gray-400 hover:text-destructive hover:bg-destructive-50 transition-colors cursor-pointer"
          aria-label="Borrar movimiento"
        >
          <Trash size={16} />
        </button>
      </div>
    </div>
  );
}
