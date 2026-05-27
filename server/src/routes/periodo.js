import express from "express";
import db from "../database.js";

const router = express.Router();

router.get('/periodo/:id_mes', async (req, res) => {
  const { id_mes } = req.params;
  try {
    const [rows] = await db.query('SELECT * FROM Periodo WHERE mes_id = ?', [id_mes]);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Error al obtener periodos' });
  }
});

router.post('/nuevo_periodo', async (req, res) => {
  const { id_mes, fecha_inicio, fecha_fin } = req.body;
  const inicio = new Date(fecha_inicio);
  const fin = new Date(fecha_fin);

  if (isNaN(inicio) || isNaN(fin)) {
    return res.status(400).json({ error: "Fechas inválidas." });
  }
  try {
    const [result] = await db.query(
      'INSERT INTO Periodo (mes_id, fecha_inicio, fecha_fin) VALUES (?, ?, ?)',
      [id_mes, inicio, fin]
    );
    res.status(200).json({ msg: "Periodo registrado satisfactoriamente", id: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Error al registrar el periodo' });
  }
});

router.put('/editar_periodo/:id', async (req, res) => {
  const { id } = req.params;
  const { fecha_inicio, fecha_fin } = req.body;
  try {
    await db.query(
      'UPDATE Periodo SET fecha_inicio = ?, fecha_fin = ? WHERE id = ?',
      [fecha_inicio, fecha_fin, id]
    );
    res.status(200).json({ msg: "Periodo actualizado satisfactoriamente" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Error al actualizar el periodo' });
  }
});

router.delete('/borrar_periodo/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await db.query('DELETE FROM Periodo WHERE id = ?', [id]);
    res.status(200).json({ msg: "Periodo borrado satisfactoriamente" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Error al borrar el periodo' });
  }
});

export default router;
