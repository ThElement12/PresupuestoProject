export default function ProgressBars({ mes }) {
  if (!mes) return null;

  return (
    <div className="space-y-3">
      <div>
        <div className="flex justify-between text-sm mb-1">
          <span className="text-red-600 font-medium">Gastos</span>
          <span className="text-gray-600">{mes.porcentajeGastos}% del presupuesto</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className="bg-red-500 h-3 rounded-full"
            style={{ width: `${mes.porcentajeGastos}%` }}
          ></div>
        </div>
      </div>
      <div>
        <div className="flex justify-between text-sm mb-1">
          <span className="text-yellow-600 font-medium">Gustos</span>
          <span className="text-gray-600">{mes.porcentajeGustos}% del presupuesto</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className="bg-yellow-500 h-3 rounded-full"
            style={{ width: `${mes.porcentajeGustos}%` }}
          ></div>
        </div>
      </div>
      <div>
        <div className="flex justify-between text-sm mb-1">
          <span className="text-green-600 font-medium">Ahorros</span>
          <span className="text-gray-600">{mes.porcentajeAhorros}% del presupuesto</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className="bg-green-500 h-3 rounded-full"
            style={{ width: `${mes.porcentajeAhorros}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
}
