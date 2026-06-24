export default function ProgressBars({ mes, totalIngresos }) {
  if (!mes) return null;

  const monto = (pct) =>
    totalIngresos != null
      ? `RD$ ${((pct / 100) * totalIngresos).toFixed(2)}`
      : null;

  const bars = [
    { label: 'Gastos',  pct: mes.porcentajeGastos,  color: 'text-red-600',    bar: 'bg-red-500' },
    { label: 'Gustos',  pct: mes.porcentajeGustos,  color: 'text-yellow-600', bar: 'bg-yellow-500' },
    { label: 'Ahorros', pct: mes.porcentajeAhorros, color: 'text-green-600',  bar: 'bg-green-500' },
  ];

  return (
    <div className="space-y-4">
      {bars.map(({ label, pct, color, bar }) => {
        const val = monto(pct);
        return (
        <div key={label}>
          <div className="flex justify-between items-start mb-1">
            <span className={`text-sm font-medium ${color}`}>{label}</span>
            <div className="text-right">
              {val && (
                <p className={`text-base font-bold ${color}`}>{val}</p>
              )}
              <p className="text-xs text-gray-500">{pct}% del presupuesto</p>
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div className={`${bar} h-3 rounded-full`} style={{ width: `${pct}%` }}></div>
          </div>
        </div>
        );
      })}
    </div>
  );
}
