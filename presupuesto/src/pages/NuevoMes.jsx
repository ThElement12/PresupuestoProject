import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import { WarningCircle, Check } from '@phosphor-icons/react';
import { Button, Input, Card } from '../components/ui';

export default function NuevoMes() {
  const { usuario } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    fecha_inicio_mes: '',
    fecha_fin_mes: '',
    periodicidad: 'mensual',
    porcentaje_gastos: 50,
    porcentaje_gustos: 30,
    porcentaje_ahorros: 20,
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const total = parseFloat(form.porcentaje_gastos) + parseFloat(form.porcentaje_gustos) + parseFloat(form.porcentaje_ahorros);
  const isValid = total === 100;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!isValid) {
      return setError(`Los porcentajes deben sumar 100 (actual: ${total})`);
    }
    setLoading(true);
    try {
      await api.crearMes({
        usuario_id: usuario.id,
        fecha_inicio_mes: form.fecha_inicio_mes,
        fecha_fin_mes: form.fecha_fin_mes,
        periodicidad: form.periodicidad,
        porcentaje_gastos: parseFloat(form.porcentaje_gastos),
        porcentaje_gustos: parseFloat(form.porcentaje_gustos),
        porcentaje_ahorros: parseFloat(form.porcentaje_ahorros),
      });
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Nuevo Ciclo de Presupuesto</h1>
      {error && (
        <div className="flex items-center gap-2 bg-destructive-50 border border-destructive/20 text-destructive rounded-lg px-4 py-3 mb-4" role="alert">
          <WarningCircle size={20} weight="fill" className="shrink-0" />
          <span className="text-sm">{error}</span>
        </div>
      )}
      <Card>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Fecha Inicio"
              type="date"
              name="fecha_inicio_mes"
              value={form.fecha_inicio_mes}
              onChange={handleChange}
              required
            />
            <Input
              label="Fecha Fin"
              type="date"
              name="fecha_fin_mes"
              value={form.fecha_fin_mes}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              ¿Cómo quieres dividir el ciclo?
            </label>
            <select
              name="periodicidad"
              value={form.periodicidad}
              onChange={handleChange}
              className="w-full border border-muted rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
            >
              <option value="mensual">Mensual — 1 periodo (todo el ciclo junto)</option>
              <option value="quincenal">Quincenal — 2 periodos (primera y segunda quincena)</option>
              <option value="semanal">Semanal — 4 o 5 periodos (una semana cada uno)</option>
            </select>
          </div>

          <div className="border-t border-[#DBEAFE] pt-5">
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-semibold text-gray-700">¿Cómo distribuyes tus ingresos?</h3>
              <span className={`flex items-center gap-1 text-sm font-medium ${isValid ? 'text-accent-500' : 'text-destructive'}`}>
                {isValid ? <Check size={16} weight="bold" /> : <WarningCircle size={16} />}
                {total}%
              </span>
            </div>
            <p className="text-xs text-gray-400 mb-4">Los porcentajes deben sumar 100%.</p>
            <div className="space-y-4">
              {[
                { name: 'porcentaje_gastos', label: 'Gastos Esenciales', hint: 'Alquiler, servicios, cuotas fijas, deudas...', color: 'accent-destructive' },
                { name: 'porcentaje_gustos', label: 'Gastos Variables', hint: 'Comida fuera, entretenimiento, caprichos...', color: 'accent-warning' },
                { name: 'porcentaje_ahorros', label: 'Ahorros', hint: 'Reservas, metas, emergencias...', color: 'accent-accent' },
              ].map(({ name, label, hint }) => (
                <div key={name}>
                  <div className="flex justify-between items-baseline mb-0.5">
                    <label className="text-sm font-medium text-gray-700">{label}</label>
                    <span className="text-sm font-semibold text-gray-800">{form[name]}%</span>
                  </div>
                  <p className="text-xs text-gray-400 mb-1.5">{hint}</p>
                  <input
                    type="range"
                    name={name}
                    value={form[name]}
                    onChange={handleChange}
                    min="0"
                    max="100"
                    className="w-full accent-primary cursor-pointer"
                  />
                </div>
              ))}
            </div>
          </div>

          <Button type="submit" className="w-full" size="lg" loading={loading}>
            Crear Ciclo
          </Button>
        </form>
      </Card>
    </div>
  );
}
