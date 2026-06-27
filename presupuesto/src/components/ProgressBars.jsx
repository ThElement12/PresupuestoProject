export default function ProgressBars({ mes, totalIngresos }) {
  if (!mes) return null;

  const monto = (pct) =>
    totalIngresos != null
      ? `RD$ ${((pct / 100) * totalIngresos).toFixed(2)}`
      : null;

  const bars = [
    { label: 'Gastos',  pct: mes.porcentajeGastos,  color: 'text-destructive',  bar: 'bg-destructive' },
    { label: 'Gustos',  pct: mes.porcentajeGustos,  color: 'text-warning',       bar: 'bg-warning' },
    { label: 'Ahorros', pct: mes.porcentajeAhorros, color: 'text-accent-500',    bar: 'bg-accent' },
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
                  <p className={`text-base font-bold tabular-nums ${color}`}>{val}</p>
                )}
                <p className="text-xs text-gray-500">{pct}% del presupuesto</p>
              </div>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-3">
              <div
                className={`${bar} h-3 rounded-full transition-all duration-500`}
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
