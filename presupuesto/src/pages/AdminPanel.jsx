import { useState, useEffect } from 'react';
import { api } from '../api/client';

export default function AdminPanel() {
  const [config, setConfig] = useState({ tasa_dolar: '0' });
  const [tasaInput, setTasaInput] = useState('');
  const [msg, setMsg] = useState('');

  useEffect(() => {
    api.getConfig()
      .then((c) => { setConfig(c); setTasaInput(c.tasa_dolar); })
      .catch(console.error);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg('');
    try {
      const res = await api.updateConfig(parseFloat(tasaInput));
      setConfig((prev) => ({ ...prev, tasa_dolar: String(res.tasa_dolar) }));
      setMsg('Tasa actualizada correctamente');
    } catch (err) {
      setMsg(err.message);
    }
  };

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Panel de Administración</h1>

      <div className="bg-white rounded-lg shadow p-6 space-y-4">
        <h2 className="text-lg font-semibold text-gray-700">Tasa del Dólar Global</h2>
        <p className="text-sm text-gray-500">
          Esta tasa se usará para convertir todos los montos en USD a RD$ en los cálculos del dashboard.
        </p>
        <p className="text-sm text-gray-500">
          Tasa actual: <span className="font-semibold text-gray-800">{config.tasa_dolar}</span>
        </p>

        {msg && (
          <div className={`px-4 py-2 rounded text-sm ${msg.includes('correctamente') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {msg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex items-end gap-3">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nueva tasa (RD$ por 1 USD)
            </label>
            <input
              type="number"
              value={tasaInput}
              onChange={(e) => setTasaInput(e.target.value)}
              step="0.0001"
              min="0"
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
          >
            Actualizar
          </button>
        </form>
      </div>
    </div>
  );
}
