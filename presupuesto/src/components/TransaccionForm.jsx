import { useState, useEffect } from 'react';
import { api } from '../api/client';

const emptyForm = {
  tipo: 'deposito',
  monto: '',
  descripcion: '',
};

export default function TransaccionForm({ periodoId, onSave, onCancel, initial }) {
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    if (initial) {
      setForm({
        tipo: initial.tipo,
        monto: initial.monto,
        descripcion: initial.descripcion || '',
      });
    }
  }, [initial]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = {
      ...form,
      periodo_id: periodoId,
      monto: parseFloat(form.monto) || 0,
    };

    try {
      if (initial?.id) {
        await api.editarTransaccionEfectivo(initial.id, data);
      } else {
        await api.crearTransaccionEfectivo(data);
      }
      onSave();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-gray-50 p-4 rounded-lg space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700">Tipo</label>
          <select
            name="tipo"
            value={form.tipo}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-md px-2 py-1.5 text-sm"
          >
            <option value="deposito">Depósito (Efectivo → Banco)</option>
            <option value="retiro">Retiro (Banco → Efectivo)</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Monto RD$</label>
          <input
            type="number"
            name="monto"
            value={form.monto}
            onChange={handleChange}
            step="0.01"
            min="0"
            className="w-full border border-gray-300 rounded-md px-2 py-1.5 text-sm"
            required
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Descripción</label>
        <input
          type="text"
          name="descripcion"
          value={form.descripcion}
          onChange={handleChange}
          className="w-full border border-gray-300 rounded-md px-2 py-1.5 text-sm"
          placeholder="Ej: Depósito en cuenta de ahorros"
        />
      </div>
      <div className="flex gap-2">
        <button
          type="submit"
          className="bg-green-600 text-white px-4 py-1.5 rounded-md hover:bg-green-700 text-sm"
        >
          {initial?.id ? 'Actualizar' : 'Agregar'}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="bg-gray-300 text-gray-700 px-4 py-1.5 rounded-md hover:bg-gray-400 text-sm"
          >
            Cancelar
          </button>
        )}
      </div>
    </form>
  );
}
