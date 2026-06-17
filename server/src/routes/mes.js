import express from "express";
import db from "../database.js";
import AppError from "../utils/AppError.js";
import asyncHandler from "../utils/asyncHandler.js";

const router = express.Router();

function formatDate(date) {
  return date.toISOString().split('T')[0];
}

function generatePeriods(periodicidad, mesId, inicio, fin) {
  const periods = [];
  const start = new Date(inicio);
  const end = new Date(fin);
  const totalDays = Math.floor((end - start) / (1000 * 60 * 60 * 24)) + 1;

  if (periodicidad === 'mensual') {
    periods.push({ mes_id: mesId, fecha_inicio: formatDate(start), fecha_fin: formatDate(end) });
  } else if (periodicidad === 'quincenal') {
    const half = Math.floor(totalDays / 2) - 1;
    const mid = new Date(start);
    mid.setDate(mid.getDate() + half);
    periods.push({ mes_id: mesId, fecha_inicio: formatDate(start), fecha_fin: formatDate(mid) });
    const midNext = new Date(mid);
    midNext.setDate(midNext.getDate() + 1);
    periods.push({ mes_id: mesId, fecha_inicio: formatDate(midNext), fecha_fin: formatDate(end) });
  } else if (periodicidad === 'semanal') {
    let current = new Date(start);
    while (current < end) {
      const weekEnd = new Date(current);
      weekEnd.setDate(weekEnd.getDate() + 6);
      const actualEnd = weekEnd < end ? weekEnd : end;
      periods.push({ mes_id: mesId, fecha_inicio: formatDate(current), fecha_fin: formatDate(actualEnd) });
      current = new Date(actualEnd);
      current.setDate(current.getDate() + 1);
    }
  }
  return periods;
}

async function propagateFixedMovements(newMesId, periodoIndex, usuarioId, newPeriodoId) {
  const [previousMes] = await db.query(
    'SELECT id FROM Mes WHERE usuario_id = ? AND id < ? ORDER BY id DESC LIMIT 1',
    [usuarioId, newMesId]
  );
  if (previousMes.length === 0) return;

  const prevMesId = previousMes[0].id;

  const [prevPeriodos] = await db.query(
    'SELECT id FROM Periodo WHERE mes_id = ? ORDER BY fecha_inicio ASC',
    [prevMesId]
  );
  if (prevPeriodos.length <= periodoIndex) return;

  const prevPeriodoId = prevPeriodos[periodoIndex].id;

  const [fixedMovements] = await db.query(
    'SELECT tipoMovimiento_id, metodo_id, descripcion, monto_usd, monto_rd, fecha_pago FROM Movimiento WHERE Periodo_id = ? AND isFijo = 1',
    [prevPeriodoId]
  );

  for (const mov of fixedMovements) {
    await db.query(
      `INSERT INTO Movimiento (tipoMovimiento_id, Periodo_id, metodo_id, descripcion, isFijo, monto_usd, monto_rd, fecha_pago, pagado)
       VALUES (?, ?, ?, ?, 1, ?, ?, ?, ?)`,
      [mov.tipoMovimiento_id, newPeriodoId, mov.metodo_id, mov.descripcion, mov.monto_usd, mov.monto_rd, mov.fecha_pago, false]
    );
  }
}

router.get('/mes-usuario/:IdUsuario', asyncHandler(async (req, res) => {
  const { IdUsuario } = req.params;
  const [rows] = await db.query(
    `SELECT m.*, MIN(p.fecha_inicio) AS fecha_inicio
     FROM Mes m
     LEFT JOIN Periodo p ON p.mes_id = m.id
     WHERE m.usuario_id = ?
     GROUP BY m.id`,
    [IdUsuario]
  );
  res.json(rows);
}));

router.get('/mes/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const [rows] = await db.query('SELECT * FROM Mes WHERE id = ?', [id]);
  res.json(rows);
}));

router.post('/nuevo-mes', asyncHandler(async (req, res) => {
  const { usuario_id, porcentaje_gastos, porcentaje_gustos, porcentaje_ahorros, periodicidad, fecha_inicio_mes, fecha_fin_mes } = req.body;

  const total = parseFloat(porcentaje_gastos) + parseFloat(porcentaje_gustos) + parseFloat(porcentaje_ahorros);
  if (total !== 100) {
    throw new AppError(400, 'Los porcentajes deben ser igual a 100', 'VALIDATION_ERROR');
  }

  const [mesResult] = await db.query(
    'INSERT INTO Mes (usuario_id, porcentajeGastos, porcentajeGustos, porcentajeAhorros, periodicidad) VALUES (?, ?, ?, ?, ?)',
    [usuario_id, porcentaje_gastos, porcentaje_gustos, porcentaje_ahorros, periodicidad || 'mensual']
  );

  const mesId = mesResult.insertId;
  const periods = generatePeriods(periodicidad || 'mensual', mesId, fecha_inicio_mes, fecha_fin_mes);

  const createdPeriods = [];
  for (let i = 0; i < periods.length; i++) {
    const p = periods[i];
    const [periodResult] = await db.query(
      'INSERT INTO Periodo (mes_id, fecha_inicio, fecha_fin, efectivo_inicial, efectivo_inicial_confirmado) VALUES (?, ?, ?, ?, ?)',
      [p.mes_id, p.fecha_inicio, p.fecha_fin, 0, false]
    );

    const periodoId = periodResult.insertId;
    await propagateFixedMovements(mesId, i, usuario_id, periodoId);

    createdPeriods.push({ id: periodoId, ...p });
  }

  res.status(201).json({ msg: "Mes registrado satisfactoriamente", mes_id: mesId, periodos: createdPeriods });
}));

router.delete('/borrar_mes/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  await db.query('DELETE FROM Mes WHERE id = ?', [id]);
  res.status(200).json({ msg: "Mes borrado satisfactoriamente" });
}));

export default router;
