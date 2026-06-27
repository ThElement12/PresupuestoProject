import { Card, CardTitle } from '../ui';
import ProgressBars from '../ProgressBars';

export default function BudgetDistribution({ mes, totalIngresos, totalGastosFijos, totalGastosDinamicos }) {
  const categories = [
    {
      label: 'Gastos Fijos',
      asignado: (mes.porcentajeGastos / 100) * totalIngresos,
      gastado: totalGastosFijos,
      barColor: 'bg-destructive',
      textColor: 'text-destructive',
    },
    {
      label: 'Gastos Variables',
      asignado: (mes.porcentajeGustos / 100) * totalIngresos,
      gastado: totalGastosDinamicos,
      barColor: 'bg-warning',
      textColor: 'text-warning',
    },
  ];

  return (
    <Card>
      <CardTitle>Distribución del Presupuesto</CardTitle>
      <div className="mt-4">
        <ProgressBars mes={mes} totalIngresos={totalIngresos} />
      </div>
      <hr className="my-4 border-[#DBEAFE]" />
      <h3 className="text-sm font-semibold text-gray-600 mb-3">Uso por categoría</h3>
      <div className="space-y-4">
        {categories.map(({ label, asignado, gastado, barColor, textColor }) => {
          const restante = asignado - gastado;
          const pctUsado = asignado > 0 ? Math.min((gastado / asignado) * 100, 100) : 0;
          return (
            <div key={label}>
              <div className="flex justify-between items-baseline mb-1">
                <span className={`text-sm font-medium ${textColor}`}>{label}</span>
                <span className="text-xs text-gray-400">de RD$ {asignado.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-500">
                  Gastado: <span className="font-medium text-gray-700">RD$ {gastado.toFixed(2)}</span>
                </span>
                <span className={`font-semibold ${restante >= 0 ? 'text-accent-500' : 'text-destructive'}`}>
                  Restante: RD$ {restante.toFixed(2)}
                </span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div
                  className={`${barColor} h-2 rounded-full transition-all duration-500`}
                  style={{ width: `${pctUsado}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
