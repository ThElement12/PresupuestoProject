import express from "express";
import db from "../database.js";
import AppError from "../utils/AppError.js";
import asyncHandler from "../utils/asyncHandler.js";
import verifyOwnership from "../utils/verifyOwnership.js";

const router = express.Router();

router.get('/metodo/:usuario_id', asyncHandler(async (req, res) => {
  const usuario_id = parseInt(req.params.usuario_id);
  if (isNaN(usuario_id)) {
    throw new AppError(400, 'usuario_id debe ser un número', 'VALIDATION_ERROR');
  }

  await verifyOwnership('usuario', usuario_id, req.usuario.id);

  const [rows] = await db.query('SELECT * FROM Metodo WHERE usuario_id = ?', [usuario_id]);
  res.json(rows);
}));

router.post('/nuevo_metodo', asyncHandler(async (req, res) => {
  const { usuario_id, metodo_pago } = req.body;

  const uid = parseInt(usuario_id);
  if (isNaN(uid)) {
    throw new AppError(400, 'usuario_id debe ser un número', 'VALIDATION_ERROR');
  }
  if (!metodo_pago || typeof metodo_pago !== 'string' || !metodo_pago.trim()) {
    throw new AppError(400, 'metodo_pago es requerido', 'VALIDATION_ERROR');
  }

  await verifyOwnership('usuario', uid, req.usuario.id);

  const [result] = await db.query('INSERT INTO Metodo (usuario_id, metodo_pago) VALUES (?, ?)', [uid, metodo_pago.trim()]);
  res.status(200).json({ msg: "Método registrado satisfactoriamente", id: result.insertId });
}));

router.put('/editar_metodo/:id', asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    throw new AppError(400, 'id debe ser un número', 'VALIDATION_ERROR');
  }
  const { metodo_pago } = req.body;
  if (!metodo_pago || typeof metodo_pago !== 'string' || !metodo_pago.trim()) {
    throw new AppError(400, 'metodo_pago es requerido', 'VALIDATION_ERROR');
  }

  await verifyOwnership('metodo', id, req.usuario.id);

  await db.query('UPDATE Metodo SET metodo_pago = ? WHERE id = ?', [metodo_pago.trim(), id]);
  res.status(200).json({ msg: "Método actualizado satisfactoriamente" });
}));

router.delete('/borrar_metodo/:id_metodo', asyncHandler(async (req, res) => {
  const id_metodo = parseInt(req.params.id_metodo);
  if (isNaN(id_metodo)) {
    throw new AppError(400, 'id_metodo debe ser un número', 'VALIDATION_ERROR');
  }

  await verifyOwnership('metodo', id_metodo, req.usuario.id);

  await db.query('DELETE FROM Metodo WHERE id = ? AND es_efectivo = ?', [id_metodo, false]);
  res.status(200).json({ msg: "Método borrado satisfactoriamente" });
}));

export default router;
