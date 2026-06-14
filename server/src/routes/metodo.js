import express from "express";
import db from "../database.js";
import asyncHandler from "../utils/asyncHandler.js";

const router = express.Router();

router.get('/metodo/:usuario_id', asyncHandler(async (req, res) => {
  const { usuario_id } = req.params;
  const [rows] = await db.query('SELECT * FROM Metodo WHERE usuario_id = ?', [usuario_id]);
  res.json(rows);
}));

router.post('/nuevo_metodo', asyncHandler(async (req, res) => {
  const { usuario_id, metodo_pago } = req.body;
  const [result] = await db.query('INSERT INTO Metodo (usuario_id, metodo_pago) VALUES (?, ?)', [usuario_id, metodo_pago]);
  res.status(200).json({ msg: "Método registrado satisfactoriamente", id: result.insertId });
}));

router.put('/editar_metodo/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { metodo_pago } = req.body;
  await db.query('UPDATE Metodo SET metodo_pago = ? WHERE id = ?', [metodo_pago, id]);
  res.status(200).json({ msg: "Método actualizado satisfactoriamente" });
}));

router.delete('/borrar_metodo/:id_metodo', asyncHandler(async (req, res) => {
  const { id_metodo } = req.params;
  await db.query('DELETE FROM Metodo WHERE id = ? AND es_efectivo = ?', [id_metodo, false]);
  res.status(200).json({ msg: "Método borrado satisfactoriamente" });
}));

export default router;
