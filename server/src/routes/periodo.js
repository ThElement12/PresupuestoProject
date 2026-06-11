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
  const { id_mes, fecha_inicio, fecha_fin, efectivo_inicial = 0 } = req.body;
  const inicio = new Date(fecha_inicio);
  const fin = new Date(fecha_fin);

  if (isNaN(inicio) || isNaN(fin)) {
    return res.status(400).json({ error: "Fechas inválidas." });
  }
  try {
    const [result] = await db.query(
      'INSERT INTO Periodo (mes_id, fecha_inicio, fecha_fin, efectivo_inicial) VALUES (?, ?, ?, ?)',
      [id_mes, inicio, fin, parseFloat(efectivo_inicial) || 0]
    );
    res.status(200).json({ msg: "Periodo registrado satisfactoriamente", id: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Error al registrar el periodo' });
  }
});

router.put('/editar_periodo/:id', async (req, res) => {
  const { id } = req.params;
  const { fecha_inicio, fecha_fin, efectivo_inicial } = req.body;
  try {
    const fields = [];
    const values = [];
    if (fecha_inicio !== undefined) { fields.push('fecha_inicio = ?'); values.push(fecha_inicio); }
    if (fecha_fin !== undefined) { fields.push('fecha_fin = ?'); values.push(fecha_fin); }
    if (efectivo_inicial !== undefined) { fields.push('efectivo_inicial = ?'); values.push(parseFloat(efectivo_inicial) || 0); }
    if (fields.length === 0) return res.status(400).json({ msg: 'No hay campos para actualizar' });
    await db.query(
      `UPDATE Periodo SET ${fields.join(', ')} WHERE id = ?`,
      [...values, id]
    );
    res.status(200).json({ msg: "Periodo actualizado satisfactoriamente" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Error al actualizar el periodo' });
  }
});

router.get('/periodo/single/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await db.query('SELECT * FROM Periodo WHERE id = ?', [id]);
    if (rows.length === 0) return res.status(404).json({ msg: 'Periodo no encontrado' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Error al obtener el periodo' });
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

router.delete('/limpiar-periodo/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await db.query('DELETE FROM Movimiento WHERE Periodo_id = ?', [id]);
    await db.query('UPDATE Periodo SET efectivo_inicial = 0 WHERE id = ?', [id]);
    res.json({ msg: 'Periodo limpiado satisfactoriamente' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Error al limpiar el periodo' });
  }
});

export default router;
