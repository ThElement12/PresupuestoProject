import { useState, useEffect } from 'react';
import { api } from '../api/client';
import { Button, Input } from './ui';

const emptyForm = {
  tipo: 'deposito',
  monto: '',
  descripcion: '',
};

export default function TransaccionForm({ periodoId, onSave, onCancel, initial }) {
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');

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
    setError('');
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
      setError(err.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-surface rounded-xl p-5 space-y-4 border border-[#DBEAFE]">
      {error && (
        <p className="text-sm text-destructive" role="alert">{error}</p>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Tipo</label>
          <select
            name="tipo"
            value={form.tipo}
            onChange={handleChange}
            className="w-full border border-muted rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors"
          >
            <option value="deposito">Depósito (Efectivo → Banco)</option>
            <option value="retiro">Retiro (Banco → Efectivo)</option>
          </select>
        </div>
        <Input
          label="Monto RD$"
          type="number"
          name="monto"
          value={form.monto}
          onChange={handleChange}
          step="0.01"
          min="0"
          required
        />
      </div>
      <Input
        label="Descripción"
        name="descripcion"
        value={form.descripcion}
        onChange={handleChange}
        placeholder="Ej: Depósito en cuenta de ahorros"
      />
      <div className="flex gap-2 pt-1">
        <Button type="submit">{initial?.id ? 'Actualizar' : 'Agregar'}</Button>
        {onCancel && (
          <Button type="button" variant="secondary" onClick={onCancel}>Cancelar</Button>
        )}
      </div>
    </form>
  );
}
