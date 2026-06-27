import { useState, useEffect } from 'react';
import { api } from '../api/client';
import { Button, Input } from './ui';

const emptyForm = {
  tipoMovimiento_id: 1,
  metodo_id: '',
  descripcion: '',
  monto_usd: '',
  monto_rd: '',
  isFijo: false,
  diaCobro: '',
  pagado: false,
};

export default function MovimientoForm({ periodoId, metodos, onSave, onCancel, initial }) {
  const [form, setForm] = useState(initial || emptyForm);
  const [tipos, setTipos] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    api.getTiposMovimiento().then(setTipos).catch(console.error);
  }, []);

  useEffect(() => {
    if (initial) {
      const day = initial.fecha_pago ? String(new Date(String(initial.fecha_pago).substring(0, 10) + 'T00:00:00').getDate()) : '';
      setForm({ ...initial, diaCobro: day });
    } else {
      setForm(emptyForm);
    }
  }, [initial]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const selectedMetodo = metodos.find((m) => m.id === parseInt(form.metodo_id));
  const esEfectivo = selectedMetodo?.es_efectivo === true;
  const esGasto = parseInt(form.tipoMovimiento_id) === 2;
  const esGastoFijo = esGasto && form.isFijo && !esEfectivo;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const data = {
      ...form,
      periodo_id: periodoId,
      monto_usd: parseFloat(form.monto_usd) || 0,
      monto_rd: parseFloat(form.monto_rd) || 0,
      metodo_id: parseInt(form.tipoMovimiento_id) === 2 ? parseInt(form.metodo_id) : null,
      tipoMovimiento_id: parseInt(form.tipoMovimiento_id),
      isFijo: esEfectivo ? false : form.isFijo,
      fecha_pago: esGastoFijo && form.diaCobro
        ? (() => {
            const today = new Date();
            const day = String(parseInt(form.diaCobro)).padStart(2, '0');
            return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${day}`;
          })()
        : null,
      pagado: esEfectivo ? true : form.pagado,
    };

    try {
      if (initial?.id) {
        await api.editarMovimiento(initial.id, data);
      } else {
        await api.crearMovimiento(data);
      }
      onSave();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <p className="text-sm text-destructive" role="alert">{error}</p>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Tipo</label>
          <select
            name="tipoMovimiento_id"
            value={form.tipoMovimiento_id}
            onChange={handleChange}
            className="w-full border border-muted rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors"
          >
            {tipos.map((t) => (
              <option key={t.id} value={t.id}>{t.movimiento}</option>
            ))}
          </select>
        </div>
        {parseInt(form.tipoMovimiento_id) === 2 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Forma de pago</label>
            <select
              name="metodo_id"
              value={form.metodo_id}
              onChange={handleChange}
              className="w-full border border-muted rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors"
              required
            >
              <option value="">Seleccionar...</option>
              {metodos.map((m) => (
                <option key={m.id} value={m.id}>{m.metodo_pago}</option>
              ))}
            </select>
          </div>
        )}
      </div>
      <Input
        label="Descripción"
        name="descripcion"
        value={form.descripcion}
        onChange={handleChange}
        required
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Input
          label="Monto USD"
          type="number"
          name="monto_usd"
          value={form.monto_usd}
          onChange={handleChange}
          step="0.01"
          min={esGasto ? undefined : "0"}
        />
        <Input
          label="Monto RD$"
          type="number"
          name="monto_rd"
          value={form.monto_rd}
          onChange={handleChange}
          step="0.01"
          min={esGasto ? undefined : "0"}
        />
      </div>
      {esGasto && (
        <p className="text-xs text-gray-400">Usa valores negativos para cashbacks o descuentos.</p>
      )}
      {esGastoFijo && (
        <Input
          label="Día de cobro"
          type="number"
          name="diaCobro"
          value={form.diaCobro}
          onChange={handleChange}
          min="1"
          max="31"
          required
        />
      )}
      {!esEfectivo && (
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input type="checkbox" name="isFijo" checked={form.isFijo} onChange={handleChange} className="accent-primary cursor-pointer" />
            ¿Se repite cada mes?
          </label>
          {parseInt(form.tipoMovimiento_id) !== 1 && (
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" name="pagado" checked={form.pagado} onChange={handleChange} className="accent-primary cursor-pointer" />
              Pagado
            </label>
          )}
        </div>
      )}
      <div className="flex gap-2 pt-2">
        <Button type="submit">{initial?.id ? 'Actualizar' : 'Agregar'}</Button>
        {onCancel && (
          <Button type="button" variant="secondary" onClick={onCancel}>Cancelar</Button>
        )}
      </div>
    </form>
  );
}
