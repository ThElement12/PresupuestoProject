import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';

export default function Metodos() {
  const { usuario } = useAuth();
  const [metodos, setMetodos] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState('');

  const loadMetodos = () => {
    api.getMetodos(usuario.id).then(setMetodos).catch(console.error);
  };

  useEffect(() => { loadMetodos(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleDelete = async (id) => {
    if (!confirm('¿Borrar esta forma de pago?')) return;
    try {
      await api.borrarMetodo(id);
      loadMetodos();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleEdit = async (id) => {
    if (!editValue.trim()) return;
    try {
      await api.editarMetodo(id, { metodo_pago: editValue });
      setEditingId(null);
      setEditValue('');
      loadMetodos();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="max-w-lg mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Formas de Pago</h1>
        <Link
          to="/metodo/nuevo"
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm"
        >
          Nuevo
        </Link>
      </div>

      {metodos.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
          No tienes formas de pago registradas.
        </div>
      ) : (
        <div className="space-y-2">
          {metodos.map((m) => (
            <div
              key={m.id}
              className="bg-white rounded-lg shadow p-4 flex items-center justify-between"
            >
              {editingId === m.id ? (
                <div className="flex items-center gap-2 flex-1">
                  <input
                    type="text"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    className="flex-1 border border-gray-300 rounded-md px-2 py-1"
                    autoFocus
                  />
                  <button
                    onClick={() => handleEdit(m.id)}
                    className="text-green-600 hover:text-green-800 text-sm"
                  >
                    Guardar
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    className="text-gray-600 hover:text-gray-800 text-sm"
                  >
                    Cancelar
                  </button>
                </div>
              ) : (
                <>
                  <span className="text-gray-800">{m.metodo_pago}</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => { setEditingId(m.id); setEditValue(m.metodo_pago); }}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(m.id)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Borrar
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
