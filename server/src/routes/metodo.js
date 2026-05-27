import express from "express";
import db from "../database.js";

const router = express.Router();

router.get('/metodo/:usuario_id', async (req, res) => {
  const { usuario_id } = req.params;
  try {
    const [rows] = await db.query('SELECT * FROM Metodo WHERE usuario_id = ?', [usuario_id]);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Error al obtener métodos' });
  }
});

router.post('/nuevo_metodo', async (req, res) => {
  const { usuario_id, metodo_pago } = req.body;
  try {
    const [result] = await db.query('INSERT INTO Metodo (usuario_id, metodo_pago) VALUES (?, ?)', [usuario_id, metodo_pago]);
    res.status(200).json({ msg: "Método registrado satisfactoriamente", id: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Error al registrar el método' });
  }
});

router.put('/editar_metodo/:id', async (req, res) => {
  const { id } = req.params;
  const { metodo_pago } = req.body;
  try {
    await db.query('UPDATE Metodo SET metodo_pago = ? WHERE id = ?', [metodo_pago, id]);
    res.status(200).json({ msg: "Método actualizado satisfactoriamente" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Error al actualizar el método' });
  }
});

router.delete('/borrar_metodo/:id_metodo', async (req, res) => {
  const { id_metodo } = req.params;
  try {
    await db.query('DELETE FROM Metodo WHERE id = ? AND es_efectivo = ?', [id_metodo, false]);
    res.status(200).json({ msg: "Método borrado satisfactoriamente" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Error al borrar el método' });
  }
});

export default router;
