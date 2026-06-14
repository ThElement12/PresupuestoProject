import express from "express";
import db from "../database.js";
import AppError from "../utils/AppError.js";
import asyncHandler from "../utils/asyncHandler.js";

const router = express.Router();

router.get('/tipo-movimiento', asyncHandler(async (req, res) => {
  const [rows] = await db.query('SELECT * FROM TipoMovimiento');
  res.json(rows);
}));

router.get('/movimiento/:id_periodo', asyncHandler(async (req, res) => {
  const { id_periodo } = req.params;
  const [[{ valor }]] = await db.query("SELECT valor FROM Configuracion WHERE clave = 'tasa_dolar'");
  const tasa = parseFloat(valor) || 0;

  const [rows] = await db.query(
    `SELECT m.*, tm.movimiento AS tipo, mt.metodo_pago, mt.es_efectivo
     FROM Movimiento m
     JOIN TipoMovimiento tm ON m.tipoMovimiento_id = tm.id
     LEFT JOIN Metodo mt ON m.metodo_id = mt.id
     WHERE m.periodo_id = ?`,
    [id_periodo]
  );

  const enriquecidos = rows.map((m) => ({
    ...m,
    totalRD: parseFloat(m.monto_rd) + parseFloat(m.monto_usd) * tasa,
  }));

  res.json(enriquecidos);
}));

router.post('/nuevo_movimiento', asyncHandler(async (req, res) => {
  const { tipoMovimiento_id, periodo_id, metodo_id, descripcion, isFijo, monto_usd, monto_rd, fecha_pago, pagado } = req.body;
  const [result] = await db.query(
    `INSERT INTO Movimiento (tipoMovimiento_id, periodo_id, metodo_id, descripcion, isFijo, monto_usd, monto_rd, fecha_pago, pagado)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [tipoMovimiento_id, periodo_id, metodo_id || null, descripcion, isFijo, monto_usd || 0, monto_rd || 0, fecha_pago || null, pagado || false]
  );
  res.status(200).json({ msg: "Movimiento registrado satisfactoriamente", id: result.insertId });
}));

router.put('/editar_movimiento/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { tipoMovimiento_id, periodo_id, metodo_id, descripcion, isFijo, monto_usd, monto_rd, fecha_pago, pagado } = req.body;
  const fields = [];
  const values = [];
  if (tipoMovimiento_id !== undefined) { fields.push('tipoMovimiento_id = ?'); values.push(tipoMovimiento_id); }
  if (periodo_id !== undefined) { fields.push('periodo_id = ?'); values.push(periodo_id); }
  if (metodo_id !== undefined) { fields.push('metodo_id = ?'); values.push(metodo_id || null); }
  if (descripcion !== undefined) { fields.push('descripcion = ?'); values.push(descripcion); }
  if (isFijo !== undefined) { fields.push('isFijo = ?'); values.push(isFijo); }
  if (monto_usd !== undefined) { fields.push('monto_usd = ?'); values.push(monto_usd || 0); }
  if (monto_rd !== undefined) { fields.push('monto_rd = ?'); values.push(monto_rd || 0); }
  if (fecha_pago !== undefined) { fields.push('fecha_pago = ?'); values.push(fecha_pago || null); }
  if (pagado !== undefined) { fields.push('pagado = ?'); values.push(pagado); }
  if (fields.length === 0) {
    throw new AppError(400, 'No hay campos para actualizar', 'VALIDATION_ERROR');
  }
  await db.query(
    `UPDATE Movimiento SET ${fields.join(', ')} WHERE id = ?`,
    [...values, id]
  );
  res.status(200).json({ msg: "Movimiento actualizado satisfactoriamente" });
}));

router.delete('/borrar_movimiento/:id_movimiento', asyncHandler(async (req, res) => {
  const { id_movimiento } = req.params;
  await db.query('DELETE FROM Movimiento WHERE id = ?', [id_movimiento]);
  res.status(200).json({ msg: "Movimiento borrado satisfactoriamente" });
}));

export default router;
