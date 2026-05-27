export default function MovimientoList({ movimientos, onEdit, onDelete }) {
  if (movimientos.length === 0) {
    return <p className="text-gray-500 text-sm">No hay movimientos en este periodo.</p>;
  }

  return (
    <div className="space-y-2">
      {movimientos.map((mov) => {
        const isIngreso = mov.tipo === 'Ingreso' || mov.tipoMovimiento_id === 1;
        return (
          <div
            key={mov.id}
            className="flex items-center justify-between bg-white border border-gray-200 rounded-lg p-3"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className={`inline-block w-2 h-2 rounded-full shrink-0 ${isIngreso ? 'bg-green-500' : 'bg-red-500'}`}
                />
                <span className="font-medium text-gray-800 truncate">{mov.descripcion}</span>
                {mov.isFijo ? (
                  <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded">
                    Fijo
                  </span>
                ) : null}
                {mov.pagado ? (
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                    Pagado
                  </span>
                ) : (
                  <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded">
                    Pendiente
                  </span>
                )}
              </div>
              <div className="flex gap-3 text-sm text-gray-500 mt-1">
                {parseFloat(mov.monto_usd) > 0 && <span>USD ${parseFloat(mov.monto_usd).toFixed(2)}</span>}
                {parseFloat(mov.monto_rd) > 0 && <span>RD$ {parseFloat(mov.monto_rd).toFixed(2)}</span>}
                {mov.fecha_pago && (
                  <span>Fecha: {new Date(mov.fecha_pago).toLocaleDateString()}</span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3 shrink-0 ml-3">
              <button
                onClick={() => onEdit(mov)}
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                Editar
              </button>
              <button
                onClick={() => onDelete(mov.id)}
                className="text-red-600 hover:text-red-800 text-sm"
              >
                Borrar
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
