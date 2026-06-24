import express from "express";
import db from "../database.js";
import AppError from "../utils/AppError.js";
import asyncHandler from "../utils/asyncHandler.js";
import verifyOwnership from "../utils/verifyOwnership.js";

const router = express.Router();

const VALID_PERIODICIDADES = ['mensual', 'quincenal', 'semanal'];

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
    'SELECT tipoMovimiento_id, metodo_id, descripcion, monto_usd, monto_rd, fecha_pago FROM Movimiento WHERE periodo_id = ? AND isFijo = 1',
    [prevPeriodoId]
  );

  if (fixedMovements.length === 0) return;

  const placeholders = fixedMovements.map(() => '(?, ?, ?, ?, 1, ?, ?, ?, ?)').join(', ');
  const values = fixedMovements.flatMap((mov) => [
    mov.tipoMovimiento_id, newPeriodoId, mov.metodo_id, mov.descripcion,
    mov.monto_usd, mov.monto_rd, mov.fecha_pago, false
  ]);

  await db.query(
    `INSERT INTO Movimiento (tipoMovimiento_id, periodo_id, metodo_id, descripcion, isFijo, monto_usd, monto_rd, fecha_pago, pagado)
     VALUES ${placeholders}`,
    values
  );
}

router.get('/mes-usuario/:IdUsuario', asyncHandler(async (req, res) => {
  const IdUsuario = parseInt(req.params.IdUsuario);
  if (isNaN(IdUsuario)) {
    throw new AppError(400, 'IdUsuario debe ser un número', 'VALIDATION_ERROR');
  }

  await verifyOwnership('usuario', IdUsuario, req.usuario.id);

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
  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    throw new AppError(400, 'id debe ser un número', 'VALIDATION_ERROR');
  }

  await verifyOwnership('mes', id, req.usuario.id);

  const [rows] = await db.query('SELECT * FROM Mes WHERE id = ?', [id]);
  res.json(rows);
}));

router.post('/nuevo-mes', asyncHandler(async (req, res) => {
  const { usuario_id, porcentaje_gastos, porcentaje_gustos, porcentaje_ahorros, periodicidad, fecha_inicio_mes, fecha_fin_mes } = req.body;

  const uid = parseInt(usuario_id);
  if (isNaN(uid)) {
    throw new AppError(400, 'usuario_id debe ser un número', 'VALIDATION_ERROR');
  }

  await verifyOwnership('usuario', uid, req.usuario.id);

  const gs = parseFloat(porcentaje_gastos);
  const gu = parseFloat(porcentaje_gustos);
  const ah = parseFloat(porcentaje_ahorros);

  if (isNaN(gs) || isNaN(gu) || isNaN(ah)) {
    throw new AppError(400, 'Porcentajes deben ser números válidos', 'VALIDATION_ERROR');
  }
  if (gs < 0 || gs > 100 || gu < 0 || gu > 100 || ah < 0 || ah > 100) {
    throw new AppError(400, 'Cada porcentaje debe estar entre 0 y 100', 'VALIDATION_ERROR');
  }
  if (Math.abs(gs + gu + ah - 100) > 0.01) {
    throw new AppError(400, 'Los porcentajes deben ser igual a 100', 'VALIDATION_ERROR');
  }

  const period = periodicidad || 'mensual';
  if (!VALID_PERIODICIDADES.includes(period)) {
    throw new AppError(400, `Periodicidad debe ser: ${VALID_PERIODICIDADES.join(', ')}`, 'VALIDATION_ERROR');
  }

  if (!fecha_inicio_mes || !fecha_fin_mes) {
    throw new AppError(400, 'Fechas de inicio y fin son requeridas', 'VALIDATION_ERROR');
  }

  const [mesResult] = await db.query(
    'INSERT INTO Mes (usuario_id, porcentajeGastos, porcentajeGustos, porcentajeAhorros, periodicidad) VALUES (?, ?, ?, ?, ?)',
    [uid, gs, gu, ah, period]
  );

  const mesId = mesResult.insertId;
  const periods = generatePeriods(period, mesId, fecha_inicio_mes, fecha_fin_mes);

  const createdPeriods = [];
  for (let i = 0; i < periods.length; i++) {
    const p = periods[i];
    const [periodResult] = await db.query(
      'INSERT INTO Periodo (mes_id, fecha_inicio, fecha_fin, efectivo_inicial, efectivo_inicial_confirmado) VALUES (?, ?, ?, ?, ?)',
      [p.mes_id, p.fecha_inicio, p.fecha_fin, 0, false]
    );

    const periodoId = periodResult.insertId;
    await propagateFixedMovements(mesId, i, uid, periodoId);

    createdPeriods.push({ id: periodoId, ...p });
  }

  res.status(201).json({ msg: "Mes registrado satisfactoriamente", mes_id: mesId, periodos: createdPeriods });
}));

router.delete('/borrar_mes/:id', asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    throw new AppError(400, 'id debe ser un número', 'VALIDATION_ERROR');
  }

  await verifyOwnership('mes', id, req.usuario.id);

  await db.query('DELETE FROM Mes WHERE id = ?', [id]);
  res.status(200).json({ msg: "Mes borrado satisfactoriamente" });
}));

export default router;
