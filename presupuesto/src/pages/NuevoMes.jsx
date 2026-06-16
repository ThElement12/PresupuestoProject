import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const total = parseFloat(form.porcentaje_gastos) + parseFloat(form.porcentaje_gustos) + parseFloat(form.porcentaje_ahorros);
    if (total !== 100) {
      return setError(`Los porcentajes deben sumar 100 (actual: ${total})`);
    }

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
    }
  };

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Nuevo Mes</h1>
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-1">
              Fecha Inicio
            </label>
            <input
              type="date"
              name="fecha_inicio_mes"
              value={form.fecha_inicio_mes}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-1">
              Fecha Fin
            </label>
            <input
              type="date"
              name="fecha_fin_mes"
              value={form.fecha_fin_mes}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-gray-700 text-sm font-medium mb-1">
            Periodicidad
          </label>
          <select
            name="periodicidad"
            value={form.periodicidad}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="mensual">Mensual (1 periodo)</option>
            <option value="quincenal">Quincenal (2 periodos)</option>
            <option value="semanal">Semanal (4-5 periodos)</option>
          </select>
        </div>

        <div className="border-t pt-4">
          <h3 className="font-semibold text-gray-700 mb-3">Porcentajes del Presupuesto (deben sumar 100%)</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-1">
                Gastos: {form.porcentaje_gastos}%
              </label>
              <input
                type="range"
                name="porcentaje_gastos"
                value={form.porcentaje_gastos}
                onChange={handleChange}
                min="0"
                max="100"
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-1">
                Gustos: {form.porcentaje_gustos}%
              </label>
              <input
                type="range"
                name="porcentaje_gustos"
                value={form.porcentaje_gustos}
                onChange={handleChange}
                min="0"
                max="100"
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-1">
                Ahorros: {form.porcentaje_ahorros}%
              </label>
              <input
                type="range"
                name="porcentaje_ahorros"
                value={form.porcentaje_ahorros}
                onChange={handleChange}
                min="0"
                max="100"
                className="w-full"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition"
        >
          Crear Mes
        </button>
      </form>
    </div>
  );
}
