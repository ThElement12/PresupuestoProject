import { Card, CardTitle, EmptyState } from '../ui';
import { Receipt } from '@phosphor-icons/react';

export default function GastosPorMetodo({ porMetodo }) {
  return (
    <Card>
      <CardTitle>Gastos por Forma de Pago</CardTitle>
      <div className="mt-4">
        {porMetodo.length === 0 ? (
          <EmptyState
            icon={Receipt}
            title="Sin gastos"
            description="No hay gastos registrados en este periodo."
            className="py-8 border-0 bg-transparent"
          />
        ) : (
          <div className="space-y-3">
            {porMetodo.map((m) => (
              <div key={m.metodo_id}>
                <div className="flex justify-between text-sm mb-1">
                  <span className={`font-medium ${m.es_efectivo ? 'text-accent-500' : 'text-gray-700'}`}>
                    {m.metodo_pago} {m.es_efectivo ? '(Efectivo)' : ''}
                  </span>
                  <span className="text-gray-600 tabular-nums">RD$ {m.total.toFixed(2)}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div
                    className="bg-primary-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(m.porcentaje, 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}
