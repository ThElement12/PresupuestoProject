import { useState } from 'react';
import { api } from '../api/client';

export default function EfectivoInicialPrompt({ periodo, onResolved }) {
  const [monto, setMonto] = useState('');
  const [saving, setSaving] = useState(false);

  const resolver = async (efectivo_inicial) => {
    setSaving(true);
    try {
      await api.editarPeriodo(periodo.id, { efectivo_inicial, efectivo_inicial_confirmado: true });
      onResolved();
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    resolver(parseFloat(monto) || 0);
  };

  return (
    <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-4 sm:p-6 space-y-3">
      <h2 className="text-lg font-bold text-gray-800">¿Cuánto efectivo tienes en mano al inicio de este periodo?</h2>
      <p className="text-sm text-gray-600">
        Antes de registrar movimientos o depósitos/retiros en este periodo, indica con cuánto
        efectivo inicia. Si no aplica, puedes colocar 0 u omitir este paso.
      </p>
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2 sm:items-end">
        <div className="flex-1">
          <label className="block text-gray-700 text-sm font-medium mb-1">
            Efectivo en mano (RD$)
          </label>
          <input
            type="number"
            step="0.01"
            value={monto}
            onChange={(e) => setMonto(e.target.value)}
            placeholder="0.00"
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoFocus
          />
        </div>
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={saving}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 text-sm whitespace-nowrap"
          >
            Guardar
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={() => resolver(0)}
            className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 disabled:opacity-50 text-sm whitespace-nowrap"
          >
            Omitir (RD$ 0.00)
          </button>
        </div>
      </form>
    </div>
  );
}
