import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import { CaretLeft, CaretRight, CalendarPlus } from '@phosphor-icons/react';
import { Button, Badge, EmptyState, Modal } from '../components/ui';
import { DashboardSkeleton } from '../components/ui/Skeleton';
import EfectivoInicialPrompt from '../components/EfectivoInicialPrompt';
import MovimientoForm from '../components/MovimientoForm';
import TransaccionForm from '../components/TransaccionForm';
import StatsGrid from '../components/dashboard/StatsGrid';
import BudgetDistribution from '../components/dashboard/BudgetDistribution';
import GastosPorMetodo from '../components/dashboard/GastosPorMetodo';
import MovimientosList from '../components/dashboard/MovimientosList';
import TransaccionesList from '../components/dashboard/TransaccionesList';
import PeriodoConfigModal from '../components/dashboard/PeriodoConfigModal';

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
  const [efectivoInput, setEfectivoInput] = useState('');
  const [transacciones, setTransacciones] = useState([]);
  const [showTransForm, setShowTransForm] = useState(false);
  const [editingTrans, setEditingTrans] = useState(null);
  const [filterMetodoId, setFilterMetodoId] = useState('todos');
  const [movError, setMovError] = useState('');
  const [transError, setTransError] = useState('');

  useEffect(() => {
    if (!usuario) return;
    api.getMeses(usuario.id)
      .then((meses) => {
        const sorted = [...meses].sort((a, b) => b.id - a.id);
        setAllMeses(sorted);
        if (sorted.length > 0) setSelectedMesId(sorted[0].id);
        else setLoading(false);
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
    const [, m, d] = iso.slice(0, 10).split('-');
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
    setMovError('');
    setTransError('');
  }, [periodoActual]);

  const handleTogglePagado = async (movId, currentPagado) => {
    try {
      await api.editarMovimiento(movId, { pagado: !currentPagado });
      setMovements((prev) => prev.map((m) => (m.id === movId ? { ...m, pagado: !currentPagado } : m)));
    } catch (err) {
      setMovError(err.message);
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

  const handleDelete = async (movId) => {
    try {
      await api.borrarMovimiento(movId);
      const movs = await api.getMovimientos(periodoActual.id);
      setMovements(movs);
    } catch (err) {
      setMovError(err.message);
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

  const handleDeleteTrans = async (transId) => {
    try {
      await api.borrarTransaccionEfectivo(transId);
      const trans = await api.getTransaccionesEfectivo(periodoActual.id);
      setTransacciones(trans);
    } catch (err) {
      setTransError(err.message);
    }
  };

  const refreshDashboard = async () => {
    const d = await api.getDashboard(usuario.id, selectedMesId);
    setData(d);
  };

  const handleEfectivoSave = async () => {
    try {
      await api.editarPeriodo(periodoActual.id, { efectivo_inicial: parseFloat(efectivoInput) || 0, efectivo_inicial_confirmado: true });
      await refreshDashboard();
    } catch (err) {
      setMovError(err.message);
    }
  };

  const handleLimpiarPeriodo = async () => {
    try {
      await api.limpiarPeriodo(periodoActual.id);
      setShowConfigModal(false);
      await refreshDashboard();
    } catch (err) {
      setMovError(err.message);
    }
  };

  const openConfigModal = () => {
    setEfectivoInput(parseFloat(periodoActual?.efectivo_inicial || 0).toFixed(2));
    setShowConfigModal(true);
  };

  const periodoData = useMemo(() => {
    const efectivoInicial = parseFloat(periodoActual?.efectivo_inicial || 0);
    let sumIngresos = 0, sumGastos = 0, cashGastos = 0, noCashGastos = 0;
    let totalGastosFijos = 0, totalGastosDinamicos = 0;
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
      if (t.tipo === 'deposito') { efectivoRestante -= monto; tarjetaRestante += monto; }
      else if (t.tipo === 'retiro') { efectivoRestante += monto; tarjetaRestante -= monto; }
    }

    return { totalIngresos, totalGastos, balance: totalIngresos - totalGastos, porMetodo, efectivoRestante, tarjetaRestante, totalGastosFijos, totalGastosDinamicos };
  }, [movements, periodoActual, transacciones]);

  const currentMesIndex = useMemo(() => allMeses.findIndex((m) => m.id === selectedMesId), [allMeses, selectedMesId]);

  if (loading) return <DashboardSkeleton />;

  if (!data || !data.mes) {
    return (
      <EmptyState
        icon={CalendarPlus}
        title={`Bienvenido, ${usuario?.nombre}`}
        description="Aún no tienes ningún mes creado. Crea tu primer mes para comenzar a gestionar tu presupuesto."
        action={
          <Link to="/mes/nuevo">
            <Button>Crear mi primer mes</Button>
          </Link>
        }
        className="py-16"
      />
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="info">{mes.periodicidad}</Badge>
            <span className="text-sm text-gray-400">{periodos.length} periodo{periodos.length !== 1 ? 's' : ''}</span>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1">
            <button
              onClick={() => { if (currentMesIndex < allMeses.length - 1) setSelectedMesId(allMeses[currentMesIndex + 1].id); }}
              disabled={currentMesIndex >= allMeses.length - 1}
              className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30 text-gray-500 transition-colors cursor-pointer disabled:cursor-not-allowed"
              title="Mes anterior"
            >
              <CaretLeft size={18} />
            </button>
            <select
              value={selectedMesId || ''}
              onChange={(e) => setSelectedMesId(parseInt(e.target.value))}
              className="border border-muted rounded-lg px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors"
            >
              {allMeses.map((m) => (
                <option key={m.id} value={m.id}>{mesLabel(m)}</option>
              ))}
            </select>
            <button
              onClick={() => { if (currentMesIndex > 0) setSelectedMesId(allMeses[currentMesIndex - 1].id); }}
              disabled={currentMesIndex <= 0}
              className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30 text-gray-500 transition-colors cursor-pointer disabled:cursor-not-allowed"
              title="Mes siguiente"
            >
              <CaretRight size={18} />
            </button>
          </div>
          {periodos.length > 1 && (
            <select
              value={selectedPeriodo || ''}
              onChange={(e) => setSelectedPeriodo(parseInt(e.target.value))}
              className="border border-muted rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors"
            >
              {periodos.map((p, i) => (
                <option key={p.id} value={p.id}>
                  Periodo {i + 1}: {formatDate(p.fecha_inicio)} – {formatDate(p.fecha_fin)}
                </option>
              ))}
            </select>
          )}
          <Link to="/mes/nuevo">
            <Button size="sm">Nuevo Mes</Button>
          </Link>
        </div>
      </div>

      {mesVencido && (
        <div className="bg-warning-50 border border-warning/30 text-warning-600 rounded-xl px-4 py-3 flex items-center justify-between">
          <span className="text-sm">El mes actual ha finalizado. Crea un nuevo mes para continuar.</span>
          <Link to="/mes/nuevo">
            <Button size="sm" className="bg-warning text-white hover:bg-warning-600">Nuevo Mes</Button>
          </Link>
        </div>
      )}

      {periodoActual && !efectivoResuelto && (
        <EfectivoInicialPrompt periodo={periodoActual} onResolved={refreshDashboard} />
      )}

      <StatsGrid {...periodoData} />

      {mes && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <BudgetDistribution
            mes={mes}
            totalIngresos={periodoData.totalIngresos}
            totalGastosFijos={periodoData.totalGastosFijos}
            totalGastosDinamicos={periodoData.totalGastosDinamicos}
          />
          <GastosPorMetodo porMetodo={periodoData.porMetodo} />
        </div>
      )}

      <MovimientosList
        movements={movements}
        metodos={metodos}
        periodoActual={periodoActual}
        efectivoResuelto={efectivoResuelto}
        filterMetodoId={filterMetodoId}
        onFilterChange={setFilterMetodoId}
        onAdd={() => { setEditingMov(null); setShowForm(true); }}
        onEdit={(mov) => { setEditingMov(mov); setShowForm(true); }}
        onDelete={handleDelete}
        onTogglePagado={handleTogglePagado}
        onOpenConfig={openConfigModal}
        error={movError}
      />

      <Modal
        open={showForm}
        onClose={() => { setShowForm(false); setEditingMov(null); }}
        title={editingMov ? 'Editar Movimiento' : 'Nuevo Movimiento'}
      >
        <MovimientoForm
          periodoId={periodoActual?.id}
          metodos={metodos}
          initial={editingMov || undefined}
          onSave={handleFormSave}
          onCancel={() => { setShowForm(false); setEditingMov(null); }}
        />
      </Modal>

      <TransaccionesList
        transacciones={transacciones}
        efectivoResuelto={efectivoResuelto}
        onAdd={() => { setEditingTrans(null); setShowTransForm(true); }}
        onEdit={(t) => { setEditingTrans(t); setShowTransForm(true); }}
        onDelete={handleDeleteTrans}
        error={transError}
      />

      {showTransForm && (
        <TransaccionForm
          periodoId={periodoActual?.id}
          initial={editingTrans || undefined}
          onSave={handleTransFormSave}
          onCancel={() => { setShowTransForm(false); setEditingTrans(null); }}
        />
      )}

      <PeriodoConfigModal
        open={showConfigModal}
        onClose={() => setShowConfigModal(false)}
        periodoActual={periodoActual}
        efectivoInput={efectivoInput}
        onEfectivoChange={setEfectivoInput}
        onEfectivoSave={handleEfectivoSave}
        onLimpiarPeriodo={handleLimpiarPeriodo}
      />
    </div>
  );
}
