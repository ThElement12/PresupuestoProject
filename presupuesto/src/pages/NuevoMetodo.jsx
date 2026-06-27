import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import { Button, Input, Card } from '../components/ui';

export default function NuevoMetodo() {
  const { usuario } = useAuth();
  const navigate = useNavigate();
  const [metodoPago, setMetodoPago] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.crearMetodo({ usuario_id: usuario.id, metodo_pago: metodoPago });
      navigate('/metodos');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Nueva Forma de Pago</h1>
      <Card>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Nombre"
            type="text"
            value={metodoPago}
            onChange={(e) => setMetodoPago(e.target.value)}
            placeholder="Ej: Tarjeta de Crédito BHD, Cuenta de Ahorros, PayPal..."
            error={error}
            required
          />
          <Button type="submit" className="w-full" size="lg" loading={loading}>
            Guardar
          </Button>
        </form>
      </Card>
    </div>
  );
}
