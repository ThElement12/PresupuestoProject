import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';

export default function NuevoMetodo() {
  const { usuario } = useAuth();
  const navigate = useNavigate();
  const [metodoPago, setMetodoPago] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.crearMetodo({ usuario_id: usuario.id, metodo_pago: metodoPago });
      navigate('/metodos');
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Nuevo Método de Pago</h1>
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-4">
        <div>
          <label className="block text-gray-700 text-sm font-medium mb-1">
            Nombre del método
          </label>
          <input
            type="text"
            value={metodoPago}
            onChange={(e) => setMetodoPago(e.target.value)}
            placeholder="Ej: Efectivo, Tarjeta, Transferencia..."
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition"
        >
          Guardar
        </button>
      </form>
    </div>
  );
}
