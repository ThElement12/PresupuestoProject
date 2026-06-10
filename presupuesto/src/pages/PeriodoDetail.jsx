import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import MovimientoList from '../components/MovimientoList';
import MovimientoForm from '../components/MovimientoForm';

export default function PeriodoDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { usuario } = useAuth();
  const [movimientos, setMovimientos] = useState([]);
  const [metodos, setMetodos] = useState([]);
  const [editEfectivo, setEditEfectivo] = useState(false);
  const [efectivoInput, setEfectivoInput] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingMov, setEditingMov] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const [movs, mets, periodoInfo] = await Promise.all([
        api.getMovimientos(id),
        api.getMetodos(usuario.id),
        api.getPeriodo(id),
      ]);
      setMovimientos(movs);
      setMetodos(mets);
      setEfectivoInput(parseFloat(periodoInfo.efectivo_inicial || 0).toFixed(2));
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadData().finally(() => setLoading(false));
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleEfectivoSave = async () => {
    try {
      await api.editarPeriodo(id, { efectivo_inicial: parseFloat(efectivoInput) || 0 });
      setEditEfectivo(false);
      loadData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleEdit = (mov) => {
    setEditingMov(mov);
    setShowForm(true);
  };

  const handleDelete = async (movId) => {
    if (!confirm('¿Borrar este movimiento?')) return;
    try {
      await api.borrarMovimiento(movId);
      loadData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleSave = () => {
    setShowForm(false);
    setEditingMov(null);
    loadData();
  };

  const handleDeletePeriodo = async () => {
    if (!confirm('¿Borrar este periodo y todos sus movimientos?')) return;
    try {
      await api.borrarPeriodo(id);
      navigate('/dashboard');
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) {
    return <div className="text-center text-gray-500">Cargando...</div>;
  }

  const ingresos = movimientos
    .filter((m) => m.tipo === 'Ingreso' || m.tipoMovimiento_id === 1)
    .reduce((sum, m) => sum + parseFloat(m.totalRD || 0), 0);
  const gastos = movimientos
    .filter((m) => m.tipo === 'Gasto' || m.tipoMovimiento_id === 2)
    .reduce((sum, m) => sum + parseFloat(m.totalRD || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Periodo</h1>
          <p className="text-gray-500">Periodo #{id}</p>
        </div>
        <button
          onClick={handleDeletePeriodo}
          className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
        >
          Borrar Periodo
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-gray-500 text-sm">Ingresos</h3>
          <p className="text-xl font-bold text-green-600">RD$ {ingresos.toFixed(2)}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-gray-500 text-sm">Gastos</h3>
          <p className="text-xl font-bold text-red-600">RD$ {gastos.toFixed(2)}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border-2 border-green-200">
          <div className="flex justify-between items-center">
            <h3 className="text-gray-500 text-sm font-medium">Efectivo en mano</h3>
            {!editEfectivo ? (
              <button onClick={() => setEditEfectivo(true)} className="text-blue-600 text-xs hover:underline">
                Editar
              </button>
            ) : null}
          </div>
          {editEfectivo ? (
            <div className="flex items-center gap-2 mt-1">
              <input
                type="number"
                step="0.01"
                value={efectivoInput}
                onChange={(e) => setEfectivoInput(e.target.value)}
                className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                autoFocus
              />
              <button onClick={handleEfectivoSave} className="bg-blue-600 text-white px-2 py-1 rounded text-xs">Guardar</button>
              <button onClick={() => setEditEfectivo(false)} className="text-gray-500 text-xs">Cancelar</button>
            </div>
          ) : (
            <p className="text-xl font-bold text-green-700">RD$ {parseFloat(efectivoInput || 0).toFixed(2)}</p>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-gray-800">Movimientos</h2>
          {!showForm && (
            <button
              onClick={() => { setEditingMov(null); setShowForm(true); }}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm"
            >
              Agregar Movimiento
            </button>
          )}
        </div>

        {showForm && (
          <MovimientoForm
            periodoId={parseInt(id)}
            metodos={metodos}
            initial={editingMov || undefined}
            onSave={handleSave}
            onCancel={() => { setShowForm(false); setEditingMov(null); }}
          />
        )}

        <div className="mt-4">
          <MovimientoList
            movimientos={movimientos}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </div>
      </div>
    </div>
  );
}
