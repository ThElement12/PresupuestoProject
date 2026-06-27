import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../api/client';
import { CaretRight, MagnifyingGlass } from '@phosphor-icons/react';
import { Button, Card, CardTitle, ConfirmDialog, EmptyState } from '../components/ui';
import { DashboardSkeleton } from '../components/ui/Skeleton';
import ProgressBars from '../components/ProgressBars';

export default function MesDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [mes, setMes] = useState(null);
  const [periodos, setPeriodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([api.getMes(id), api.getPeriodos(id)])
      .then(([mesData, periodosData]) => {
        setMes(mesData[0]);
        setPeriodos(periodosData);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  const handleDelete = async () => {
    try {
      await api.borrarMes(id);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    }
    setConfirmOpen(false);
  };

  if (loading) return <DashboardSkeleton />;

  if (!mes) {
    return (
      <EmptyState
        icon={MagnifyingGlass}
        title="Mes no encontrado"
        description="El ciclo que buscas no existe o fue eliminado."
        action={<Link to="/dashboard"><Button>Volver al Dashboard</Button></Link>}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Detalle del Mes</h1>
          <p className="text-gray-500 capitalize text-sm mt-1">Periodicidad: {mes.periodicidad}</p>
        </div>
        <Button variant="destructive" size="sm" onClick={() => setConfirmOpen(true)}>
          Borrar Mes
        </Button>
      </div>

      {error && (
        <p className="text-sm text-destructive" role="alert">{error}</p>
      )}

      <Card>
        <CardTitle className="mb-4">Distribución</CardTitle>
        <ProgressBars mes={mes} />
      </Card>

      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-gray-800">Periodos</h2>
        {periodos.map((periodo, idx) => (
          <Link key={periodo.id} to={`/periodo/${periodo.id}`}>
            <Card hover className="flex justify-between items-center mb-3">
              <div>
                <h3 className="font-semibold text-gray-800">Periodo {idx + 1}</h3>
                <p className="text-sm text-gray-500">
                  {new Date(periodo.fecha_inicio).toLocaleDateString()} –{' '}
                  {new Date(periodo.fecha_fin).toLocaleDateString()}
                </p>
              </div>
              <CaretRight size={20} className="text-gray-400" />
            </Card>
          </Link>
        ))}
      </div>

      <ConfirmDialog
        open={confirmOpen}
        onConfirm={handleDelete}
        onCancel={() => setConfirmOpen(false)}
        title="¿Borrar este mes?"
        description="Se eliminarán todos los periodos y movimientos asociados. Esta acción no se puede deshacer."
        confirmText="Borrar Mes"
      />
    </div>
  );
}
