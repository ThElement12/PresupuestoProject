import { TrendUp, TrendDown, Scales, Money, CreditCard } from '@phosphor-icons/react';
import { Card } from '../ui';
import { formatRD } from '../../utils/format';

const stats = [
  { key: 'ingresos', label: 'Ingresos', icon: TrendUp, color: 'text-accent-500' },
  { key: 'gastos', label: 'Gastos', icon: TrendDown, color: 'text-destructive-500' },
  { key: 'balance', label: 'Balance Total', icon: Scales, colorFn: (v) => v >= 0 ? 'text-primary' : 'text-destructive-500' },
  { key: 'efectivo', label: 'Efectivo Restante', icon: Money, colorFn: (v) => v >= 0 ? 'text-accent-500' : 'text-destructive-500', border: 'border-accent-100' },
  { key: 'tarjeta', label: 'Tarjeta/Banco', icon: CreditCard, colorFn: (v) => v >= 0 ? 'text-primary' : 'text-destructive-500', border: 'border-primary-100' },
];

export default function StatsGrid({ totalIngresos, totalGastos, balance, efectivoRestante, tarjetaRestante }) {
  const values = {
    ingresos: totalIngresos,
    gastos: totalGastos,
    balance,
    efectivo: efectivoRestante,
    tarjeta: tarjetaRestante,
  };

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-5">
      {stats.map(({ key, label, icon: Icon, color, colorFn, border }) => {
        const value = values[key];
        const textColor = colorFn ? colorFn(value) : color;
        return (
          <Card key={key} className={`p-4 lg:p-6 ${border ? `border-2 ${border}` : ''}`}>
            <div className="flex items-center gap-2 mb-2">
              <Icon size={18} className="text-gray-400" />
              <h3 className="text-gray-500 text-sm font-medium">{label}</h3>
            </div>
            <p className={`text-lg sm:text-xl lg:text-2xl font-bold tabular-nums ${textColor}`}>
              {formatRD(value)}
            </p>
          </Card>
        );
      })}
    </div>
  );
}
