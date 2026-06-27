import { useState, useEffect } from 'react';
import { api } from '../api/client';
import { Check, WarningCircle } from '@phosphor-icons/react';
import { Button, Input, Card, CardTitle } from '../components/ui';

export default function AdminPanel() {
  const [config, setConfig] = useState({ tasa_dolar: '0' });
  const [tasaInput, setTasaInput] = useState('');
  const [msg, setMsg] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.getConfig()
      .then((c) => { setConfig(c); setTasaInput(c.tasa_dolar); })
      .catch(console.error);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg('');
    setLoading(true);
    try {
      const res = await api.updateConfig(parseFloat(tasaInput));
      setConfig((prev) => ({ ...prev, tasa_dolar: String(res.tasa_dolar) }));
      setMsg('Tasa actualizada correctamente');
      setIsSuccess(true);
    } catch (err) {
      setMsg(err.message);
      setIsSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Panel de Administración</h1>

      <Card>
        <CardTitle>Tasa del Dólar Global</CardTitle>
        <p className="text-sm text-gray-500 mt-2">
          Esta tasa se usará para convertir todos los montos en USD a RD$ en los cálculos del dashboard.
        </p>
        <div className="mt-4 mb-5">
          <span className="text-sm text-gray-500">Tasa actual:</span>
          <span className="ml-2 bg-primary-50 text-primary text-xl font-bold px-4 py-1.5 rounded-xl tabular-nums">
            {Number(config.tasa_dolar).toFixed(2)}
          </span>
        </div>

        {msg && (
          <div
            className={`flex items-center gap-2 rounded-lg px-4 py-3 mb-4 text-sm ${
              isSuccess
                ? 'bg-accent-50 border border-accent/20 text-accent-500'
                : 'bg-destructive-50 border border-destructive/20 text-destructive'
            }`}
            role="alert"
          >
            {isSuccess ? <Check size={18} weight="bold" /> : <WarningCircle size={18} weight="fill" />}
            {msg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1">
            <Input
              label="Nueva tasa (RD$ por 1 USD)"
              type="number"
              value={tasaInput}
              onChange={(e) => setTasaInput(e.target.value)}
              step="0.01"
              min="1"
              required
            />
          </div>
          <Button type="submit" loading={loading} className="sm:mb-0">
            Actualizar
          </Button>
        </form>
      </Card>
    </div>
  );
}
