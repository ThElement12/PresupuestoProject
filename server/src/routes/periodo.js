import express from "express";
import db from "../database.js";
import AppError from "../utils/AppError.js";
import asyncHandler from "../utils/asyncHandler.js";

const router = express.Router();

router.get('/periodo/:id_mes', asyncHandler(async (req, res) => {
  const { id_mes } = req.params;
  const [rows] = await db.query('SELECT * FROM Periodo WHERE mes_id = ?', [id_mes]);
  res.json(rows);
}));

router.post('/nuevo_periodo', asyncHandler(async (req, res) => {
  const { id_mes, fecha_inicio, fecha_fin, efectivo_inicial = 0, efectivo_inicial_confirmado = false } = req.body;
  const inicio = new Date(fecha_inicio);
  const fin = new Date(fecha_fin);

  if (isNaN(inicio) || isNaN(fin)) {
    throw new AppError(400, 'Fechas inválidas.', 'VALIDATION_ERROR');
  }

  const [result] = await db.query(
    'INSERT INTO Periodo (mes_id, fecha_inicio, fecha_fin, efectivo_inicial, efectivo_inicial_confirmado) VALUES (?, ?, ?, ?, ?)',
    [id_mes, inicio, fin, parseFloat(efectivo_inicial) || 0, !!efectivo_inicial_confirmado]
  );
  res.status(200).json({ msg: "Periodo registrado satisfactoriamente", id: result.insertId });
}));

router.put('/editar_periodo/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { fecha_inicio, fecha_fin, efectivo_inicial, efectivo_inicial_confirmado } = req.body;
  const fields = [];
  const values = [];
  if (fecha_inicio !== undefined) { fields.push('fecha_inicio = ?'); values.push(fecha_inicio); }
  if (fecha_fin !== undefined) { fields.push('fecha_fin = ?'); values.push(fecha_fin); }
  if (efectivo_inicial !== undefined) { fields.push('efectivo_inicial = ?'); values.push(parseFloat(efectivo_inicial) || 0); }
  if (efectivo_inicial_confirmado !== undefined) { fields.push('efectivo_inicial_confirmado = ?'); values.push(!!efectivo_inicial_confirmado); }
  if (fields.length === 0) {
    throw new AppError(400, 'No hay campos para actualizar', 'VALIDATION_ERROR');
  }
  await db.query(
    `UPDATE Periodo SET ${fields.join(', ')} WHERE id = ?`,
    [...values, id]
  );
  res.status(200).json({ msg: "Periodo actualizado satisfactoriamente" });
}));

router.get('/periodo/single/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const [rows] = await db.query('SELECT * FROM Periodo WHERE id = ?', [id]);
  if (rows.length === 0) {
    throw new AppError(404, 'Periodo no encontrado', 'NOT_FOUND');
  }
  res.json(rows[0]);
}));

router.delete('/borrar_periodo/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  await db.query('DELETE FROM Periodo WHERE id = ?', [id]);
  res.status(200).json({ msg: "Periodo borrado satisfactoriamente" });
}));

router.delete('/limpiar-periodo/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  await db.query('DELETE FROM Movimiento WHERE Periodo_id = ?', [id]);
  await db.query('UPDATE Periodo SET efectivo_inicial = 0, efectivo_inicial_confirmado = 0 WHERE id = ?', [id]);
  res.json({ msg: 'Periodo limpiado satisfactoriamente' });
}));

export default router;
