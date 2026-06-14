import express from "express";
import db from "../database.js";
import AppError from "../utils/AppError.js";
import asyncHandler from "../utils/asyncHandler.js";

const router = express.Router();

router.get('/transaccion-efectivo/:periodo_id', asyncHandler(async (req, res) => {
  const { periodo_id } = req.params;
  const [rows] = await db.query(
    'SELECT * FROM TransaccionEfectivo WHERE periodo_id = ? ORDER BY id ASC',
    [periodo_id]
  );
  res.json(rows);
}));

router.post('/nueva-transaccion-efectivo', asyncHandler(async (req, res) => {
  const { periodo_id, tipo, monto, descripcion, fecha } = req.body;
  if (!periodo_id || !tipo || monto === undefined) {
    throw new AppError(400, 'periodo_id, tipo y monto son requeridos', 'VALIDATION_ERROR');
  }
  if (!['deposito', 'retiro'].includes(tipo)) {
    throw new AppError(400, 'tipo debe ser deposito o retiro', 'VALIDATION_ERROR');
  }
  const [result] = await db.query(
    `INSERT INTO TransaccionEfectivo (periodo_id, tipo, monto, descripcion, fecha)
     VALUES (?, ?, ?, ?, ?)`,
    [periodo_id, tipo, parseFloat(monto) || 0, descripcion || null, fecha || null]
  );
  res.status(200).json({ msg: "Transacción registrada satisfactoriamente", id: result.insertId });
}));

router.put('/editar-transaccion-efectivo/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
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
  const { id } = req.params;
  await db.query('DELETE FROM TransaccionEfectivo WHERE id = ?', [id]);
  res.status(200).json({ msg: "Transacción borrada satisfactoriamente" });
}));

export default router;
