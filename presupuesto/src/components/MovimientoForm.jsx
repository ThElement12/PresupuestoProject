import { useState, useEffect } from 'react';
import { api } from '../api/client';

const emptyForm = {
  tipoMovimiento_id: 1,
  metodo_id: '',
  descripcion: '',
  monto_usd: '',
  monto_rd: '',
  isFijo: false,
  fecha_pago: '',
  pagado: false,
};

export default function MovimientoForm({ periodoId, metodos, onSave, onCancel, initial }) {
  const [form, setForm] = useState(initial || emptyForm);
  const [tipos, setTipos] = useState([]);

  useEffect(() => {
    api.getTiposMovimiento().then(setTipos).catch(console.error);
  }, []);

  useEffect(() => {
    if (initial) setForm(initial);
  }, [initial]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = {
      ...form,
      periodo_id: periodoId,
      monto_usd: parseFloat(form.monto_usd) || 0,
      monto_rd: parseFloat(form.monto_rd) || 0,
      metodo_id: parseInt(form.metodo_id),
      tipoMovimiento_id: parseInt(form.tipoMovimiento_id),
      fecha_pago: form.fecha_pago || null,
    };

    try {
      if (initial?.id) {
        await api.editarMovimiento(initial.id, data);
      } else {
        await api.crearMovimiento(data);
      }
      onSave();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3 bg-gray-50 p-4 rounded-lg">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700">Tipo</label>
          <select
            name="tipoMovimiento_id"
            value={form.tipoMovimiento_id}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-md px-2 py-1.5 text-sm"
          >
            {tipos.map((t) => (
              <option key={t.id} value={t.id}>
                {t.movimiento}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Método</label>
          <select
            name="metodo_id"
            value={form.metodo_id}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-md px-2 py-1.5 text-sm"
            required
          >
            <option value="">Seleccionar...</option>
            {metodos.map((m) => (
              <option key={m.id} value={m.id}>
                {m.metodo_pago}
              </option>
            ))}
          </select>
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
          required
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700">Monto USD</label>
          <input
            type="number"
            name="monto_usd"
            value={form.monto_usd}
            onChange={handleChange}
            step="0.01"
            min="0"
            className="w-full border border-gray-300 rounded-md px-2 py-1.5 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Monto RD$</label>
          <input
            type="number"
            name="monto_rd"
            value={form.monto_rd}
            onChange={handleChange}
            step="0.01"
            min="0"
            className="w-full border border-gray-300 rounded-md px-2 py-1.5 text-sm"
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700">Fecha de pago</label>
          <input
            type="date"
            name="fecha_pago"
            value={form.fecha_pago}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-md px-2 py-1.5 text-sm"
          />
        </div>
      </div>
      <div className="flex items-center gap-4">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="isFijo"
            checked={form.isFijo}
            onChange={handleChange}
          />
          Movimiento fijo
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="pagado"
            checked={form.pagado}
            onChange={handleChange}
          />
          Pagado
        </label>
      </div>
      <div className="flex gap-2">
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-1.5 rounded-md hover:bg-blue-700 text-sm"
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
