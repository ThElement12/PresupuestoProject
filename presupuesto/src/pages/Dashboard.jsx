import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import ProgressBars from '../components/ProgressBars';
import MovimientoForm from '../components/MovimientoForm';
import TransaccionForm from '../components/TransaccionForm';
import EfectivoInicialPrompt from '../components/EfectivoInicialPrompt';

export default function Dashboard() {
  const { usuario } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriodo, setSelectedPeriodo] = useState(null);
  const [allMeses, setAllMeses] = useState([]);
  const [selectedMesId, setSelectedMesId] = useState(null);
  const [movements, setMovements] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingMov, setEditingMov] = useState(null);
  const [metodos, setMetodos] = useState([]);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [editEfectivo, setEditEfectivo] = useState(false);
  const [efectivoInput, setEfectivoInput] = useState('');

  const [transacciones, setTransacciones] = useState([]);
  const [showTransForm, setShowTransForm] = useState(false);
  const [editingTrans, setEditingTrans] = useState(null);
  const [filterMetodoId, setFilterMetodoId] = useState('todos');

  useEffect(() => {
    if (!usuario) return;
    api.getMeses(usuario.id)
      .then((meses) => {
        const sorted = [...meses].sort((a, b) => b.id - a.id);
        setAllMeses(sorted);
        if (sorted.length > 0) {
          setSelectedMesId(sorted[0].id);
        } else {
          setLoading(false);
        }
      })
      .catch(console.error);
  }, [usuario]);

  useEffect(() => {
    if (!usuario || !selectedMesId) return;
    setLoading(true);
    api.getDashboard(usuario.id, selectedMesId)
      .then((d) => {
        setData(d);
        const todayStr = new Date().toISOString().split('T')[0];
        const activo = d.periodos?.find(
          (p) => p.fecha_inicio.slice(0, 10) <= todayStr && todayStr <= p.fecha_fin.slice(0, 10)
        );
        setSelectedPeriodo(activo?.id ?? d.periodos?.[0]?.id ?? null);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [usuario, selectedMesId]);

  useEffect(() => {
    if (!usuario) return;
    api.getMetodos(usuario.id).then(setMetodos).catch(console.error);
  }, [usuario]);

  const { mes, periodos } = data || {};
  const periodoActual = periodos?.find((p) => p.id === selectedPeriodo) || periodos?.[0];
  const efectivoResuelto = !!periodoActual?.efectivo_inicial_confirmado;

  const today = new Date().toISOString().split('T')[0];
  const esUltimoMes = allMeses.length > 0 && selectedMesId === allMeses[0].id;
  const hayPeriodoActivo = periodos?.some((p) => p.fecha_inicio.slice(0, 10) <= today && today <= p.fecha_fin.slice(0, 10));
  const mesVencido = esUltimoMes && periodos?.length > 0 && !hayPeriodoActivo;

  const formatDate = (iso) => {
    const str = iso.slice(0, 10);
    const [, m, d] = str.split('-');
    return `${d}/${m}`;
  };

  const mesLabel = (m) => {
    if (!m.fecha_inicio) return `Mes #${m.id}`;
    const d = new Date(m.fecha_inicio.slice(0, 10) + 'T12:00:00');
    return d.toLocaleString('es-ES', { month: 'long', year: 'numeric' });
  };

  useEffect(() => {
    setMovements(periodoActual?.movimientos || []);
    setTransacciones(periodoActual?.transacciones || []);
    setShowForm(false);
    setEditingMov(null);
    setShowTransForm(false);
    setEditingTrans(null);
    setFilterMetodoId('todos');
  }, [periodoActual]);

  const handleTogglePagado = async (movId, currentPagado) => {
    try {
      await api.editarMovimiento(movId, { pagado: !currentPagado });
      setMovements((prev) =>
        prev.map((m) => (m.id === movId ? { ...m, pagado: !currentPagado } : m))
      );
    } catch (err) {
      alert(err.message);
    }
  };

  const handleFormSave = async () => {
    setShowForm(false);
    setEditingMov(null);
    try {
      const movs = await api.getMovimientos(periodoActual.id);
      setMovements(movs);
    } catch (err) {
      console.error(err);
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
      const movs = await api.getMovimientos(periodoActual.id);
      setMovements(movs);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleTransFormSave = async () => {
    setShowTransForm(false);
    setEditingTrans(null);
    try {
      const trans = await api.getTransaccionesEfectivo(periodoActual.id);
      setTransacciones(trans);
    } catch (err) {
      console.error(err);
    }
  };

  const handleEditTrans = (trans) => {
    setEditingTrans(trans);
    setShowTransForm(true);
  };

  const handleDeleteTrans = async (transId) => {
    if (!confirm('¿Borrar esta transacción?')) return;
    try {
      await api.borrarTransaccionEfectivo(transId);
      const trans = await api.getTransaccionesEfectivo(periodoActual.id);
      setTransacciones(trans);
    } catch (err) {
      alert(err.message);
    }
  };

  const refreshDashboard = async () => {
    const d = await api.getDashboard(usuario.id, selectedMesId);
    setData(d);
  };

  const handleEfectivoSave = async () => {
    try {
      await api.editarPeriodo(periodoActual.id, { efectivo_inicial: parseFloat(efectivoInput) || 0, efectivo_inicial_confirmado: true });
      setEditEfectivo(false);
      await refreshDashboard();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleLimpiarPeriodo = async () => {
    if (!confirm('¿Reiniciar este periodo? Se borrarán todos los movimientos y el efectivo en mano volverá a 0.')) return;
    try {
      await api.limpiarPeriodo(periodoActual.id);
      setShowConfigModal(false);
      await refreshDashboard();
    } catch (err) {
      alert(err.message);
    }
  };

  const openConfigModal = () => {
    setEfectivoInput(parseFloat(periodoActual?.efectivo_inicial || 0).toFixed(2));
    setEditEfectivo(false);
    setShowConfigModal(true);
  };

  const periodoData = useMemo(() => {
    const efectivoInicial = parseFloat(periodoActual?.efectivo_inicial || 0);
    let sumIngresos = 0;
    let sumGastos = 0;
    let cashGastos = 0;
    let noCashGastos = 0;
    let totalGastosFijos = 0;
    let totalGastosDinamicos = 0;
    const porMetodoMap = {};

    for (const m of movements) {
      const rd = parseFloat(m.totalRD || 0);
      if (m.tipo === 'Ingreso') {
        sumIngresos += rd;
      } else {
        sumGastos += rd;
        if (m.es_efectivo) cashGastos += rd; else noCashGastos += rd;
        if (m.isFijo) totalGastosFijos += rd; else totalGastosDinamicos += rd;
        if (!m.pagado) {
          const key = m.metodo_id;
          if (!porMetodoMap[key]) {
            porMetodoMap[key] = { metodo_id: m.metodo_id, metodo_pago: m.metodo_pago, es_efectivo: m.es_efectivo, total: 0 };
          }
          porMetodoMap[key].total += rd;
        }
      }
    }

    const totalIngresos = sumIngresos + efectivoInicial;
    const totalGastos = sumGastos;
    const porMetodo = Object.values(porMetodoMap).map((m) => ({
      ...m,
      porcentaje: totalGastos > 0 ? (m.total / totalGastos) * 100 : 0,
    }));

    let efectivoRestante = efectivoInicial - cashGastos;
    let tarjetaRestante = (totalIngresos - efectivoInicial) - noCashGastos;

    for (const t of transacciones) {
      const monto = parseFloat(t.monto) || 0;
      if (t.tipo === 'deposito') {
        efectivoRestante -= monto;
        tarjetaRestante += monto;
      } else if (t.tipo === 'retiro') {
        efectivoRestante += monto;
        tarjetaRestante -= monto;
      }
    }

    return {
      totalIngresos,
      totalGastos,
      balance: totalIngresos - totalGastos,
      porMetodo,
      efectivoRestante,
      tarjetaRestante,
      totalGastosFijos,
      totalGastosDinamicos,
    };
  }, [movements, periodoActual, transacciones]);

  const {
    totalIngresos,
    totalGastos,
    balance,
    porMetodo,
    efectivoRestante,
    tarjetaRestante,
    totalGastosFijos,
    totalGastosDinamicos,
  } = periodoData;

  const currentMesIndex = useMemo(
    () => allMeses.findIndex((m) => m.id === selectedMesId),
    [allMeses, selectedMesId]
  );

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

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
          <p className="text-gray-500 capitalize">
            Frecuencia: {mes.periodicidad} | {periodos.length} periodo{periodos.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1">
            <button
              onClick={() => {
                if (currentMesIndex < allMeses.length - 1) setSelectedMesId(allMeses[currentMesIndex + 1].id);
              }}
              disabled={currentMesIndex >= allMeses.length - 1}
              className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-30 text-gray-600"
              title="Mes anterior"
            >
              &#8592;
            </button>
            <select
              value={selectedMesId || ''}
              onChange={(e) => setSelectedMesId(parseInt(e.target.value))}
              className="border border-gray-300 rounded-md px-2 py-1.5 text-sm"
            >
              {allMeses.map((m) => (
                <option key={m.id} value={m.id}>
                  {mesLabel(m)}
                </option>
              ))}
            </select>
            <button
              onClick={() => {
                if (currentMesIndex > 0) setSelectedMesId(allMeses[currentMesIndex - 1].id);
              }}
              disabled={currentMesIndex <= 0}
              className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-30 text-gray-600"
              title="Mes siguiente"
            >
              &#8594;
            </button>
          </div>
          {periodos.length > 1 && (
            <select
              value={selectedPeriodo || ''}
              onChange={(e) => setSelectedPeriodo(parseInt(e.target.value))}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm"
            >
              {periodos.map((p, i) => (
                <option key={p.id} value={p.id}>
                  Periodo {i + 1}: {formatDate(p.fecha_inicio)} – {formatDate(p.fecha_fin)}
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

      {mesVencido && (
        <div className="bg-amber-50 border border-amber-300 text-amber-800 rounded-lg px-4 py-3 flex items-center justify-between">
          <span>El mes actual ha finalizado. Crea un nuevo mes para continuar.</span>
          <Link
            to="/mes/nuevo"
            className="ml-4 bg-amber-600 text-white px-3 py-1 rounded hover:bg-amber-700 text-sm whitespace-nowrap"
          >
            Nuevo Mes
          </Link>
        </div>
      )}

      {periodoActual && !efectivoResuelto && (
        <EfectivoInicialPrompt periodo={periodoActual} onResolved={refreshDashboard} />
      )}

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-5">
        <div className="bg-white rounded-lg shadow p-4 lg:p-6">
          <h3 className="text-gray-500 text-sm font-medium">Ingresos</h3>
          <p className="text-lg sm:text-xl lg:text-2xl font-bold text-green-600">
            RD$ {totalIngresos.toFixed(2)}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 lg:p-6">
          <h3 className="text-gray-500 text-sm font-medium">Gastos</h3>
          <p className="text-lg sm:text-xl lg:text-2xl font-bold text-red-600">
            RD$ {totalGastos.toFixed(2)}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 lg:p-6">
          <h3 className="text-gray-500 text-sm font-medium">Balance Total</h3>
          <p className={`text-lg sm:text-xl lg:text-2xl font-bold ${balance >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
            RD$ {balance.toFixed(2)}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 lg:p-6 border-2 border-green-200">
          <h3 className="text-gray-500 text-sm font-medium">Efectivo Restante</h3>
          <p className={`text-lg sm:text-xl lg:text-2xl font-bold ${efectivoRestante >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            RD$ {efectivoRestante.toFixed(2)}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 lg:p-6 border-2 border-blue-200">
          <h3 className="text-gray-500 text-sm font-medium">Tarjeta/Banco Restante</h3>
          <p className={`text-lg sm:text-xl lg:text-2xl font-bold ${tarjetaRestante >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
            RD$ {tarjetaRestante.toFixed(2)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Distribución del Presupuesto</h2>
          <ProgressBars mes={mes} totalIngresos={totalIngresos} />
          {mes && (
            <>
              <hr className="my-4 border-gray-200" />
              <h3 className="text-sm font-semibold text-gray-600 mb-3">Uso por categoría</h3>
              <div className="space-y-4">
                {[
                  {
                    label: 'Gastos Fijos',
                    asignado: (mes.porcentajeGastos / 100) * totalIngresos,
                    gastado: totalGastosFijos,
                    barColor: 'bg-red-500',
                    textColor: 'text-red-600',
                  },
                  {
                    label: 'Gastos Variables',
                    asignado: (mes.porcentajeGustos / 100) * totalIngresos,
                    gastado: totalGastosDinamicos,
                    barColor: 'bg-yellow-500',
                    textColor: 'text-yellow-600',
                  },
                ].map(({ label, asignado, gastado, barColor, textColor }) => {
                  const restante = asignado - gastado;
                  const pctUsado = asignado > 0 ? Math.min((gastado / asignado) * 100, 100) : 0;
                  return (
                    <div key={label}>
                      <div className="flex justify-between items-baseline mb-1">
                        <span className={`text-sm font-medium ${textColor}`}>{label}</span>
                        <span className="text-xs text-gray-400">de RD$ {asignado.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-500">Gastado: <span className="font-medium text-gray-700">RD$ {gastado.toFixed(2)}</span></span>
                        <span className={`font-semibold ${restante >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          Restante: RD$ {restante.toFixed(2)}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className={`${barColor} h-2 rounded-full`} style={{ width: `${pctUsado}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Gastos por Forma de Pago</h2>
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
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-bold text-gray-800">Movimientos</h2>
          <div className="flex items-center gap-3">
            {!showForm && efectivoResuelto && (
              <button
                onClick={() => { setEditingMov(null); setShowForm(true); }}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm"
              >
                Agregar Movimiento
              </button>
            )}
            <button
              onClick={openConfigModal}
              className="text-gray-500 hover:text-gray-700 text-sm font-medium"
            >
              Ajustar periodo
            </button>
          </div>
        </div>

        <select
          value={filterMetodoId}
          onChange={(e) => setFilterMetodoId(e.target.value === 'todos' ? 'todos' : parseInt(e.target.value))}
          className="w-full sm:w-auto border border-gray-300 rounded-md px-3 py-2 text-sm"
        >
          <option value="todos">Todos los métodos</option>
          {metodos.map((m) => (
            <option key={m.id} value={m.id}>{m.metodo_pago}</option>
          ))}
        </select>

        {showForm && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
            onClick={() => { setShowForm(false); setEditingMov(null); }}
          >
            <div
              className="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto p-4 sm:p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <MovimientoForm
                periodoId={periodoActual?.id}
                metodos={metodos}
                initial={editingMov || undefined}
                onSave={handleFormSave}
                onCancel={() => { setShowForm(false); setEditingMov(null); }}
              />
            </div>
          </div>
        )}

        {!showForm && movements.length === 0 ? (
          <p className="text-gray-500 text-sm">No hay movimientos en este periodo.</p>
        ) : null}

        {!showForm && (movements.length > 0 || parseFloat(periodoActual?.efectivo_inicial || 0) > 0) && (
          <>
            {(() => {
              const filteredMovements = filterMetodoId === 'todos'
                ? movements
                : movements.filter((m) => m.metodo_id === filterMetodoId);
              const ingresos = movements.filter((m) => m.tipo === 'Ingreso');
              const gastosFijos = filteredMovements.filter((m) => m.tipo === 'Gasto' && m.isFijo);
              const gastosDinamicos = filteredMovements.filter((m) => m.tipo === 'Gasto' && !m.isFijo);
              const efectivoInicial = parseFloat(periodoActual?.efectivo_inicial || 0);
              const showEfectivoInicial = efectivoInicial > 0 && (filterMetodoId === 'todos' || !!metodos.find(m => m.id === filterMetodoId)?.es_efectivo);
              return (
                <>
                  {(ingresos.length > 0 || showEfectivoInicial) && (
                    <div>
                      <h3 className="text-md font-bold text-green-700 mb-2">
                        Ingresos
                        <span className="text-sm font-normal text-gray-500 ml-2">
                          (RD$ {(ingresos.reduce((s, m) => s + parseFloat(m.totalRD || 0), 0) + (showEfectivoInicial ? efectivoInicial : 0)).toFixed(2)})
                        </span>
                      </h3>
                      <div className="space-y-2">
                        {showEfectivoInicial && (
                          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between bg-white border border-green-200 rounded-lg p-3">
                            <div className="flex items-center gap-3 min-w-0">
                              <span className="inline-block w-2 h-2 rounded-full shrink-0 bg-green-500" />
                              <span className="font-medium text-gray-800">Saldo inicial en efectivo</span>
                              <span className="text-sm text-gray-500 shrink-0">Efectivo</span>
                            </div>
                            <span className="font-medium text-green-600 text-right">
                              RD$ {efectivoInicial.toFixed(2)}
                            </span>
                          </div>
                        )}
                        {ingresos.map((mov) => (
                          <div
                            key={mov.id}
                            className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between bg-white border border-gray-200 rounded-lg p-3"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <span className="inline-block w-2 h-2 rounded-full shrink-0 bg-green-500" />
                              <span className="font-medium text-gray-800 truncate">{mov.descripcion}</span>
                              <span className="text-sm text-gray-500 shrink-0">
                                {mov.metodo_pago}
                              </span>
                            </div>
                            <div className="flex items-center justify-end gap-3 shrink-0 sm:ml-3">
                              <div className="text-right">
                                <span className="font-medium text-green-600">
                                  RD$ {parseFloat(mov.totalRD).toFixed(2)}
                                </span>
                                {parseFloat(mov.monto_usd) > 0 && (
                                  <span className="block text-xs text-gray-400">
                                    US$ {parseFloat(mov.monto_usd).toFixed(2)}
                                  </span>
                                )}
                              </div>
                              <button
                                onClick={() => handleEdit(mov)}
                                className="text-blue-600 hover:text-blue-800 text-sm py-1"
                              >
                                Editar
                              </button>
                              <button
                                onClick={() => handleDelete(mov.id)}
                                className="text-red-600 hover:text-red-800 text-sm py-1"
                              >
                                Borrar
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <h3 className="text-md font-bold text-red-700 mb-2">Gastos Fijos</h3>
                    {gastosFijos.length === 0 ? (
                      <p className="text-gray-500 text-sm">
                        {filterMetodoId === 'todos' ? 'No hay gastos fijos registrados.' : 'No hay gastos fijos con este método de pago.'}
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {gastosFijos.map((mov) => {
                          const esCashback = parseFloat(mov.totalRD) < 0;
                          const diaPago = mov.fecha_pago ? new Date(String(mov.fecha_pago).substring(0, 10) + 'T00:00:00').getDate() : null;
                          return (
                          <div
                            key={mov.id}
                            className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between bg-white border border-gray-200 rounded-lg p-3"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              {mov.es_efectivo ? (
                                <span className="inline-block w-4 h-4 shrink-0" />
                              ) : (
                                <input
                                  type="checkbox"
                                  checked={!!mov.pagado}
                                  onChange={() => handleTogglePagado(mov.id, mov.pagado)}
                                  className="h-4 w-4 shrink-0"
                                />
                              )}
                              <span className={`inline-block w-2 h-2 rounded-full shrink-0 ${esCashback ? 'bg-green-500' : 'bg-red-500'}`} />
                              <span className="font-medium text-gray-800 truncate">{mov.descripcion}</span>
                              <span className="text-sm text-gray-500 shrink-0">
                                {mov.metodo_pago}
                              </span>
                              {diaPago && (
                                <span className="text-xs text-blue-600 shrink-0">
                                  Cobro el día {diaPago} de c/mes
                                </span>
                              )}
                            </div>
                            <div className="flex items-center justify-end gap-3 shrink-0 sm:ml-3">
                              <div className="text-right">
                                <span className={`font-medium ${esCashback ? 'text-green-600' : 'text-red-600'}`}>
                                  {esCashback ? '+' : ''}RD$ {Math.abs(parseFloat(mov.totalRD)).toFixed(2)}
                                </span>
                                {parseFloat(mov.monto_usd) > 0 && (
                                  <span className="block text-xs text-gray-400">
                                    US$ {parseFloat(mov.monto_usd).toFixed(2)}
                                  </span>
                                )}
                              </div>
                              {esCashback && (
                                <span className="text-xs px-2 py-0.5 rounded bg-green-100 text-green-700">Cashback</span>
                              )}
                              <span
                                className={`text-xs px-2 py-0.5 rounded ${
                                  mov.pagado || mov.es_efectivo
                                    ? 'bg-green-100 text-green-700'
                                    : 'bg-yellow-100 text-yellow-700'
                                }`}
                              >
                                {mov.pagado || mov.es_efectivo ? 'Pagado' : 'Pendiente'}
                              </span>
                              <button
                                onClick={() => handleEdit(mov)}
                                className="text-blue-600 hover:text-blue-800 text-sm py-1"
                              >
                                Editar
                              </button>
                              <button
                                onClick={() => handleDelete(mov.id)}
                                className="text-red-600 hover:text-red-800 text-sm py-1"
                              >
                                Borrar
                              </button>
                            </div>
                          </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  <div>
                    <h3 className="text-md font-bold text-orange-700 mb-2">Gastos Variables</h3>
                    {gastosDinamicos.length === 0 ? (
                      <p className="text-gray-500 text-sm">
                        {filterMetodoId === 'todos' ? 'No hay gastos variables registrados.' : 'No hay gastos variables con este método de pago.'}
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {gastosDinamicos.map((mov) => {
                          const esCashback = parseFloat(mov.totalRD) < 0;
                          const fechaRegistro = mov.created_at
                            ? new Date(mov.created_at).toLocaleDateString('es-DO', { day: 'numeric', month: 'short' })
                            : null;
                          return (
                          <div
                            key={mov.id}
                            className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between bg-white border border-gray-200 rounded-lg p-3"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              {mov.es_efectivo ? (
                                <span className="inline-block w-4 h-4 shrink-0" />
                              ) : (
                                <input
                                  type="checkbox"
                                  checked={!!mov.pagado}
                                  onChange={() => handleTogglePagado(mov.id, mov.pagado)}
                                  className="h-4 w-4 shrink-0"
                                />
                              )}
                              <span className={`inline-block w-2 h-2 rounded-full shrink-0 ${esCashback ? 'bg-green-500' : 'bg-red-500'}`} />
                              <span className="font-medium text-gray-800 truncate">{mov.descripcion}</span>
                              <span className="text-sm text-gray-500 shrink-0">
                                {mov.metodo_pago}
                              </span>
                              {fechaRegistro && (
                                <span className="text-xs text-gray-400 shrink-0">
                                  {fechaRegistro}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center justify-end gap-3 shrink-0 sm:ml-3">
                              <div className="text-right">
                                <span className={`font-medium ${esCashback ? 'text-green-600' : 'text-red-600'}`}>
                                  {esCashback ? '+' : ''}RD$ {Math.abs(parseFloat(mov.totalRD)).toFixed(2)}
                                </span>
                                {parseFloat(mov.monto_usd) > 0 && (
                                  <span className="block text-xs text-gray-400">
                                    US$ {parseFloat(mov.monto_usd).toFixed(2)}
                                  </span>
                                )}
                              </div>
                              {esCashback && (
                                <span className="text-xs px-2 py-0.5 rounded bg-green-100 text-green-700">Cashback</span>
                              )}
                              <span
                                className={`text-xs px-2 py-0.5 rounded ${
                                  mov.pagado || mov.es_efectivo
                                    ? 'bg-green-100 text-green-700'
                                    : 'bg-yellow-100 text-yellow-700'
                                }`}
                              >
                                {mov.pagado || mov.es_efectivo ? 'Pagado' : 'Pendiente'}
                              </span>
                              <button
                                onClick={() => handleEdit(mov)}
                                className="text-blue-600 hover:text-blue-800 text-sm py-1"
                              >
                                Editar
                              </button>
                              <button
                                onClick={() => handleDelete(mov.id)}
                                className="text-red-600 hover:text-red-800 text-sm py-1"
                              >
                                Borrar
                              </button>
                            </div>
                          </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </>
              );
            })()}
          </>
        )}

        {showConfigModal && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
            onClick={() => setShowConfigModal(false)}
          >
            <div
              className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-4 sm:p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-bold text-gray-800">Ajustar Periodo</h2>
                <button
                  onClick={() => setShowConfigModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-xl leading-none"
                >
                  &times;
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-gray-500 text-sm font-medium mb-2">Periodo #{periodoActual?.id}</h3>
                </div>

                <div>
                  <h3 className="text-gray-500 text-sm font-medium mb-2">Efectivo en mano al inicio</h3>
                  {editEfectivo ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        step="0.01"
                        value={efectivoInput}
                        onChange={(e) => setEfectivoInput(e.target.value)}
                        className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                        autoFocus
                      />
                      <button
                        onClick={handleEfectivoSave}
                        className="bg-blue-600 text-white px-3 py-1.5 rounded text-sm whitespace-nowrap"
                      >
                        Guardar
                      </button>
                      <button
                        onClick={() => setEditEfectivo(false)}
                        className="text-gray-500 text-sm whitespace-nowrap"
                      >
                        Cancelar
                      </button>
                    </div>
                  ) : (
                    <div className="flex justify-between items-center">
                      <p className="text-xl font-bold text-gray-800">
                        RD$ {parseFloat(efectivoInput || 0).toFixed(2)}
                      </p>
                      <button
                        onClick={() => setEditEfectivo(true)}
                        className="text-blue-600 text-sm hover:underline"
                      >
                        Editar
                      </button>
                    </div>
                  )}
                </div>

                <hr className="border-gray-200" />

                <div>
                  <h3 className="text-gray-500 text-sm font-medium mb-2 text-red-600">Zona de Peligro</h3>
                  <button
                    onClick={handleLimpiarPeriodo}
                    className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 text-sm"
                  >
                    Reiniciar Periodo
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-bold text-gray-800">Depósitos y Retiros</h2>
          <div className="flex items-center gap-3">
            {!showTransForm && efectivoResuelto && (
              <button
                onClick={() => { setEditingTrans(null); setShowTransForm(true); }}
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 text-sm"
              >
                Agregar Depósito/Retiro
              </button>
            )}
          </div>
        </div>

        {showTransForm && (
          <TransaccionForm
            periodoId={periodoActual?.id}
            initial={editingTrans || undefined}
            onSave={handleTransFormSave}
            onCancel={() => { setShowTransForm(false); setEditingTrans(null); }}
          />
        )}

        {!showTransForm && transacciones.length === 0 ? (
          <p className="text-gray-500 text-sm">No hay depósitos o retiros en este periodo.</p>
        ) : null}

        {!showTransForm && transacciones.length > 0 && (
          <div className="space-y-2">
            {transacciones.map((t) => (
              <div
                key={t.id}
                className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between bg-white border border-gray-200 rounded-lg p-3"
              >
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 min-w-0">
                  <span
                    className={`inline-block w-2 h-2 rounded-full shrink-0 ${
                      t.tipo === 'deposito' ? 'bg-blue-500' : 'bg-green-500'
                    }`}
                  />
                  <span className="font-medium text-gray-800 truncate">{t.descripcion || 'Sin descripción'}</span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded font-medium ${
                      t.tipo === 'deposito'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-green-100 text-green-700'
                    }`}
                  >
                    {t.tipo === 'deposito' ? 'Depósito → Banco' : 'Retiro → Efectivo'}
                  </span>
                </div>
                <div className="flex items-center justify-end gap-3 shrink-0 sm:ml-3">
                  <span className="font-medium text-gray-700">
                    RD$ {parseFloat(t.monto).toFixed(2)}
                  </span>
                  <button
                    onClick={() => handleEditTrans(t)}
                    className="text-blue-600 hover:text-blue-800 text-sm py-1"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDeleteTrans(t.id)}
                    className="text-red-600 hover:text-red-800 text-sm py-1"
                  >
                    Borrar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
