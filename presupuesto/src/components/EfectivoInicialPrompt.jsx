import { useState } from 'react';
import { api } from '../api/client';
import { Wallet } from '@phosphor-icons/react';
import { Button, Input } from './ui';

export default function EfectivoInicialPrompt({ periodo, onResolved }) {
  const [monto, setMonto] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const resolver = async (efectivo_inicial) => {
    setSaving(true);
    setError('');
    try {
      await api.editarPeriodo(periodo.id, { efectivo_inicial, efectivo_inicial_confirmado: true });
      onResolved();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    resolver(parseFloat(monto) || 0);
  };

  return (
    <div className="bg-warning-50 border-2 border-warning/30 rounded-xl p-4 sm:p-6 space-y-3">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-warning-100 flex items-center justify-center shrink-0">
          <Wallet size={22} className="text-warning" />
        </div>
        <h2 className="text-lg font-semibold text-gray-800">¿Cuánto efectivo tienes en mano?</h2>
      </div>
      <p className="text-sm text-gray-600">
        Antes de registrar movimientos, indica con cuánto efectivo inicia este periodo. Si no aplica, puedes colocar 0 u omitir.
      </p>
      {error && (
        <p className="text-sm text-destructive" role="alert">{error}</p>
      )}
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2 sm:items-end">
        <div className="flex-1">
          <Input
            label="Efectivo en mano (RD$)"
            type="number"
            step="0.01"
            value={monto}
            onChange={(e) => setMonto(e.target.value)}
            placeholder="0.00"
            autoFocus
          />
        </div>
        <div className="flex gap-2">
          <Button type="submit" loading={saving}>Guardar</Button>
          <Button type="button" variant="secondary" disabled={saving} onClick={() => resolver(0)}>
            Omitir (RD$ 0)
          </Button>
        </div>
      </form>
    </div>
  );
}
