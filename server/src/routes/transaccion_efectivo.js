import express from "express";
import db from "../database.js";
import AppError from "../utils/AppError.js";
import asyncHandler from "../utils/asyncHandler.js";
import verifyOwnership from "../utils/verifyOwnership.js";

const router = express.Router();

router.get('/transaccion-efectivo/:periodo_id', asyncHandler(async (req, res) => {
  const periodo_id = parseInt(req.params.periodo_id);
  if (isNaN(periodo_id)) {
    throw new AppError(400, 'periodo_id debe ser un número', 'VALIDATION_ERROR');
  }

  await verifyOwnership('periodo', periodo_id, req.usuario.id);

  const [rows] = await db.query(
    'SELECT * FROM TransaccionEfectivo WHERE periodo_id = ? ORDER BY id ASC',
    [periodo_id]
  );
  res.json(rows);
}));

router.post('/nueva-transaccion-efectivo', asyncHandler(async (req, res) => {
  const { periodo_id, tipo, monto, descripcion, fecha } = req.body;

  const pid = parseInt(periodo_id);
  if (!periodo_id || isNaN(pid)) {
    throw new AppError(400, 'periodo_id debe ser un número', 'VALIDATION_ERROR');
  }
  if (!tipo || monto === undefined) {
    throw new AppError(400, 'periodo_id, tipo y monto son requeridos', 'VALIDATION_ERROR');
  }
  if (!['deposito', 'retiro'].includes(tipo)) {
    throw new AppError(400, 'tipo debe ser deposito o retiro', 'VALIDATION_ERROR');
  }

  await verifyOwnership('periodo', pid, req.usuario.id);

  const [periodoRows] = await db.query('SELECT efectivo_inicial_confirmado FROM Periodo WHERE id = ?', [pid]);
  if (periodoRows.length === 0) {
    throw new AppError(404, 'Periodo no encontrado', 'NOT_FOUND');
  }
  if (!periodoRows[0].efectivo_inicial_confirmado) {
    throw new AppError(400, 'Debes definir el efectivo inicial de este periodo antes de registrar movimientos.', 'PERIODO_NO_RESUELTO');
  }

  const [result] = await db.query(
    `INSERT INTO TransaccionEfectivo (periodo_id, tipo, monto, descripcion, fecha)
     VALUES (?, ?, ?, ?, ?)`,
    [pid, tipo, parseFloat(monto) || 0, descripcion || null, fecha || null]
  );
  res.status(200).json({ msg: "Transacción registrada satisfactoriamente", id: result.insertId });
}));

router.put('/editar-transaccion-efectivo/:id', asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    throw new AppError(400, 'id debe ser un número', 'VALIDATION_ERROR');
  }

  await verifyOwnership('transaccion', id, req.usuario.id);

  const { tipo, monto, descripcion, fecha } = req.body;
  const fields = [];
  const values = [];
  if (tipo !== undefined) {
    if (!['deposito', 'retiro'].includes(tipo)) {
      throw new AppError(400, 'tipo debe ser deposito o retiro', 'VALIDATION_ERROR');
    }
    fields.push('tipo = ?');
    values.push(tipo);
  }
  if (monto !== undefined) {
    fields.push('monto = ?');
    values.push(parseFloat(monto) || 0);
  }
  if (descripcion !== undefined) {
    fields.push('descripcion = ?');
    values.push(descripcion || null);
  }
  if (fecha !== undefined) {
    fields.push('fecha = ?');
    values.push(fecha || null);
  }
  if (fields.length === 0) {
    throw new AppError(400, 'No hay campos para actualizar', 'VALIDATION_ERROR');
  }
  await db.query(
    `UPDATE TransaccionEfectivo SET ${fields.join(', ')} WHERE id = ?`,
    [...values, id]
  );
  res.status(200).json({ msg: "Transacción actualizada satisfactoriamente" });
}));

router.delete('/borrar-transaccion-efectivo/:id', asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    throw new AppError(400, 'id debe ser un número', 'VALIDATION_ERROR');
  }

  await verifyOwnership('transaccion', id, req.usuario.id);

  await db.query('DELETE FROM TransaccionEfectivo WHERE id = ?', [id]);
  res.status(200).json({ msg: "Transacción borrada satisfactoriamente" });
}));

export default router;
