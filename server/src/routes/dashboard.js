import express from "express";
import db from "../database.js";
import AppError from "../utils/AppError.js";
import asyncHandler from "../utils/asyncHandler.js";
import verifyOwnership from "../utils/verifyOwnership.js";

const router = express.Router();

function totalEnRD(monto_usd, monto_rd, tasa) {
  return parseFloat(monto_rd) + parseFloat(monto_usd) * tasa;
}

router.get('/dashboard/:usuario_id', asyncHandler(async (req, res) => {
  const usuario_id = parseInt(req.params.usuario_id);
  if (isNaN(usuario_id)) {
    throw new AppError(400, 'usuario_id debe ser un número', 'VALIDATION_ERROR');
  }

  await verifyOwnership('usuario', usuario_id, req.usuario.id);

  const { mes_id } = req.query;
  const parsedMesId = mes_id ? parseInt(mes_id) : null;
  if (mes_id && isNaN(parsedMesId)) {
    throw new AppError(400, 'mes_id debe ser un número', 'VALIDATION_ERROR');
  }

  const [meses] = parsedMesId
    ? await db.query('SELECT * FROM Mes WHERE id = ? AND usuario_id = ?', [parsedMesId, usuario_id])
    : await db.query('SELECT * FROM Mes WHERE usuario_id = ? ORDER BY id DESC LIMIT 1', [usuario_id]);

  if (meses.length === 0) {
    return res.json({ mes: null, periodos: [], resumen: { totalIngresos: 0, totalGastos: 0, balance: 0 } });
  }

  const mes = meses[0];

  const [periodos] = await db.query(
    'SELECT * FROM Periodo WHERE mes_id = ? ORDER BY fecha_inicio ASC',
    [mes.id]
  );

  if (periodos.length === 0) {
    return res.json({ mes, periodos: [], resumen: { totalIngresos: 0, totalGastos: 0, balance: 0 } });
  }

  const [[{ valor }]] = await db.query("SELECT valor FROM Configuracion WHERE clave = 'tasa_dolar'");
  const tasa = parseFloat(valor) || 0;

  const periodoIds = periodos.map((p) => p.id);

  const [allMovimientos] = await db.query(
    `SELECT m.*, tm.movimiento AS tipo, mt.metodo_pago, mt.es_efectivo
     FROM Movimiento m
     JOIN TipoMovimiento tm ON m.tipoMovimiento_id = tm.id
     LEFT JOIN Metodo mt ON m.metodo_id = mt.id
     WHERE m.periodo_id IN (?)`,
    [periodoIds]
  );

  const [allTransacciones] = await db.query(
    'SELECT * FROM TransaccionEfectivo WHERE periodo_id IN (?) ORDER BY id ASC',
    [periodoIds]
  );

  const movsByPeriodo = {};
  const transByPeriodo = {};
  for (const id of periodoIds) {
    movsByPeriodo[id] = [];
    transByPeriodo[id] = [];
  }
  for (const mov of allMovimientos) movsByPeriodo[mov.periodo_id].push(mov);
  for (const t of allTransacciones) transByPeriodo[t.periodo_id].push(t);

  const periodosConMovimientos = [];
  let totalIngresos = 0;
  let totalGastos = 0;
  let totalEfectivoInicial = 0;
  const gastosPorMetodo = {};

  for (const periodo of periodos) {
    totalEfectivoInicial += parseFloat(periodo.efectivo_inicial) || 0;
    const movimientos = movsByPeriodo[periodo.id];
    const transacciones = transByPeriodo[periodo.id];

    let ingresos = parseFloat(periodo.efectivo_inicial) || 0;
    let gastos = 0;
    const movsEnriquecidos = [];

    for (const mov of movimientos) {
      const total = totalEnRD(mov.monto_usd, mov.monto_rd, tasa);
      const esIngreso = mov.tipo === 'Ingreso';

      if (esIngreso) {
        ingresos += total;
      } else {
        gastos += total;
        const key = mov.metodo_id;
        if (!gastosPorMetodo[key]) {
          gastosPorMetodo[key] = {
            metodo_id: mov.metodo_id,
            metodo_pago: mov.metodo_pago,
            es_efectivo: mov.es_efectivo,
            total: 0,
          };
        }
        gastosPorMetodo[key].total += total;
      }

      movsEnriquecidos.push({ ...mov, totalRD: total });
    }

    totalIngresos += ingresos;
    totalGastos += gastos;

    periodosConMovimientos.push({
      ...periodo,
      movimientos: movsEnriquecidos,
      transacciones,
      ingresos,
      gastos,
    });
  }

  const porMetodo = Object.values(gastosPorMetodo).map((m) => ({
    ...m,
    porcentaje: totalGastos > 0 ? (m.total / totalGastos) * 100 : 0,
  }));

  let cashGastos = 0;
  let noCashGastos = 0;
  for (const m of porMetodo) {
    if (m.es_efectivo) {
      cashGastos += m.total;
    } else {
      noCashGastos += m.total;
    }
  }

  let efectivoRestante = totalEfectivoInicial - cashGastos;
  let tarjetaRestante = (totalIngresos - totalEfectivoInicial) - noCashGastos;

  for (const periodo of periodosConMovimientos) {
    for (const t of periodo.transacciones) {
      const monto = parseFloat(t.monto) || 0;
      if (t.tipo === 'deposito') {
        efectivoRestante -= monto;
        tarjetaRestante += monto;
      } else if (t.tipo === 'retiro') {
        efectivoRestante += monto;
        tarjetaRestante -= monto;
      }
    }
  }

  res.json({
    mes,
    periodos: periodosConMovimientos,
    resumen: {
      totalIngresos,
      totalGastos,
      balance: totalIngresos - totalGastos,
      totalEfectivoInicial,
    },
    porMetodo,
    efectivoRestante,
    tarjetaRestante,
  });
}));

export default router;
