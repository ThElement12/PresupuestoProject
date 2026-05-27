import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../api/client';
import ProgressBars from '../components/ProgressBars';

export default function MesDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [mes, setMes] = useState(null);
  const [periodos, setPeriodos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.getMes(id),
      api.getPeriodos(id),
    ])
      .then(([mesData, periodosData]) => {
        setMes(mesData[0]);
        setPeriodos(periodosData);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  const handleDelete = async () => {
    if (!confirm('¿Borrar este mes y todos sus periodos?')) return;
    try {
      await api.borrarMes(id);
      navigate('/dashboard');
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) {
    return <div className="text-center text-gray-500">Cargando...</div>;
  }

  if (!mes) {
    return <div className="text-center text-gray-500">Mes no encontrado</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Detalle del Mes
          </h1>
          <p className="text-gray-500 capitalize">
            Periodicidad: {mes.periodicidad}
          </p>
        </div>
        <button
          onClick={handleDelete}
          className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
        >
          Borrar Mes
        </button>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-bold text-gray-800 mb-4">Distribución</h2>
        <ProgressBars mes={mes} />
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-bold text-gray-800">Periodos</h2>
        {periodos.map((periodo, idx) => (
          <Link
            key={periodo.id}
            to={`/periodo/${periodo.id}`}
            className="block bg-white rounded-lg shadow p-4 hover:shadow-md transition"
          >
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-semibold text-gray-800">
                  Periodo {idx + 1}
                </h3>
                <p className="text-sm text-gray-500">
                  {new Date(periodo.fecha_inicio).toLocaleDateString()} -{' '}
                  {new Date(periodo.fecha_fin).toLocaleDateString()}
                </p>
              </div>
              <span className="text-blue-600">&rarr;</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
