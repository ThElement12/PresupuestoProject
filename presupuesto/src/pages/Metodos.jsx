import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import { Plus, PencilSimple, Trash, CreditCard } from '@phosphor-icons/react';
import { Button, Card, Input, EmptyState, ConfirmDialog } from '../components/ui';

export default function Metodos() {
  const { usuario } = useAuth();
  const [metodos, setMetodos] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState(null);
  const [error, setError] = useState('');

  const loadMetodos = () => {
    api.getMetodos(usuario.id).then(setMetodos).catch(console.error);
  };

  useEffect(() => { loadMetodos(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleDelete = async () => {
    try {
      await api.borrarMetodo(pendingDeleteId);
      loadMetodos();
    } catch (err) {
      setError(err.message);
    }
    setConfirmOpen(false);
    setPendingDeleteId(null);
  };

  const handleEdit = async (id) => {
    if (!editValue.trim()) return;
    try {
      await api.editarMetodo(id, { metodo_pago: editValue });
      setEditingId(null);
      setEditValue('');
      loadMetodos();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="max-w-lg mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Formas de Pago</h1>
        <Link to="/metodo/nuevo">
          <Button size="sm">
            <Plus size={16} />
            Nuevo
          </Button>
        </Link>
      </div>

      {error && (
        <p className="text-sm text-destructive mb-4" role="alert">{error}</p>
      )}

      {metodos.length === 0 ? (
        <EmptyState
          icon={CreditCard}
          title="Sin formas de pago"
          description="No tienes formas de pago registradas. Agrega tu primera tarjeta o cuenta."
          action={
            <Link to="/metodo/nuevo">
              <Button size="sm"><Plus size={16} /> Agregar</Button>
            </Link>
          }
        />
      ) : (
        <div className="space-y-2">
          {metodos.map((m) => (
            <Card key={m.id} className="p-4 flex items-center justify-between">
              {editingId === m.id ? (
                <div className="flex items-center gap-2 flex-1">
                  <Input
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    autoFocus
                    className="flex-1"
                  />
                  <Button size="sm" onClick={() => handleEdit(m.id)}>Guardar</Button>
                  <Button variant="ghost" size="sm" onClick={() => setEditingId(null)}>Cancelar</Button>
                </div>
              ) : (
                <>
                  <span className="text-gray-800 font-medium">{m.metodo_pago}</span>
                  <div className="flex gap-1">
                    <button
                      onClick={() => { setEditingId(m.id); setEditValue(m.metodo_pago); }}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-primary hover:bg-primary-50 transition-colors cursor-pointer"
                      aria-label="Editar forma de pago"
                    >
                      <PencilSimple size={16} />
                    </button>
                    <button
                      onClick={() => { setPendingDeleteId(m.id); setConfirmOpen(true); }}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-destructive hover:bg-destructive-50 transition-colors cursor-pointer"
                      aria-label="Borrar forma de pago"
                    >
                      <Trash size={16} />
                    </button>
                  </div>
                </>
              )}
            </Card>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={confirmOpen}
        onConfirm={handleDelete}
        onCancel={() => { setConfirmOpen(false); setPendingDeleteId(null); }}
        title="¿Borrar esta forma de pago?"
        description="Se eliminará permanentemente. Los movimientos asociados no serán afectados."
        confirmText="Borrar"
      />
    </div>
  );
}
