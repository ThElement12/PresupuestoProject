import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import ProgressBars from '../components/ProgressBars';

export default function Dashboard() {
  const { usuario } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriodo, setSelectedPeriodo] = useState(null);

  useEffect(() => {
    if (!usuario) return;
    api.getDashboard(usuario.id)
      .then((d) => {
        setData(d);
        if (d.periodos?.length > 0) setSelectedPeriodo(d.periodos[0].id);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [usuario]);

  if (loading) {
    return <div className="text-center text-gray-500">Cargando...</div>;
  }

  if (!data || !data.mes) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          Bienvenido, {usuario?.nombre}
        </h2>
        <p className="text-gray-600 mb-6">Aún no tienes ningún mes creado.</p>
        <Link
          to="/mes/nuevo"
          className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700"
        >
          Crear mi primer mes
        </Link>
      </div>
    );
  }

  const { mes, periodos, resumen, porMetodo, efectivoRestante } = data;
  const periodoActual = periodos.find((p) => p.id === selectedPeriodo) || periodos[0];

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
          <p className="text-gray-500 capitalize">
            Periodicidad: {mes.periodicidad} | {periodos.length} periodo{periodos.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {periodos.length > 1 && (
            <select
              value={selectedPeriodo || ''}
              onChange={(e) => setSelectedPeriodo(parseInt(e.target.value))}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm"
            >
              {periodos.map((p, i) => (
                <option key={p.id} value={p.id}>
                  Periodo {i + 1}
                </option>
              ))}
            </select>
          )}
          <Link
            to="/mes/nuevo"
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Nuevo Mes
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-gray-500 text-sm font-medium">Ingresos</h3>
          <p className="text-2xl font-bold text-green-600">
            RD$ {resumen.totalIngresos.toFixed(2)}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-gray-500 text-sm font-medium">Gastos</h3>
          <p className="text-2xl font-bold text-red-600">
            RD$ {resumen.totalGastos.toFixed(2)}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-gray-500 text-sm font-medium">Balance</h3>
          <p className={`text-2xl font-bold ${resumen.balance >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
            RD$ {resumen.balance.toFixed(2)}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6 border-2 border-green-200">
          <h3 className="text-gray-500 text-sm font-medium">Efectivo Restante</h3>
          <p className={`text-2xl font-bold ${efectivoRestante >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            RD$ {efectivoRestante.toFixed(2)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Distribución del Presupuesto</h2>
          <ProgressBars mes={mes} />
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Gastos por Método de Pago</h2>
          {porMetodo.length === 0 ? (
            <p className="text-gray-500 text-sm">No hay gastos registrados.</p>
          ) : (
            <div className="space-y-3">
              {porMetodo.map((m) => (
                <div key={m.metodo_id}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className={`font-medium ${m.es_efectivo ? 'text-green-700' : 'text-gray-700'}`}>
                      {m.metodo_pago} {m.es_efectivo ? '(Efectivo)' : ''}
                    </span>
                    <span className="text-gray-600">RD$ {m.total.toFixed(2)}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full"
                      style={{ width: `${Math.min(m.porcentaje, 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-bold text-gray-800">Periodos</h2>
        {periodos.map((periodo, idx) => {
          const isActive = periodo.id === periodoActual?.id;
          return (
            <Link
              key={periodo.id}
              to={`/periodo/${periodo.id}`}
              className={`block bg-white rounded-lg shadow p-4 hover:shadow-md transition ${isActive ? 'ring-2 ring-blue-400' : ''}`}
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
                <div className="text-right">
                  <p className="text-green-600 font-medium">
                    +RD$ {periodo.ingresos.toFixed(2)}
                  </p>
                  <p className="text-red-600 font-medium">
                    -RD$ {periodo.gastos.toFixed(2)}
                  </p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
