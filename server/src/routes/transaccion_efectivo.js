import express from "express";
import db from "../database.js";

const router = express.Router();

router.get('/transaccion-efectivo/:periodo_id', async (req, res) => {
  const { periodo_id } = req.params;
  try {
    const [rows] = await db.query(
      'SELECT * FROM TransaccionEfectivo WHERE periodo_id = ? ORDER BY id ASC',
      [periodo_id]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Error al obtener transacciones de efectivo' });
  }
});

router.post('/nueva-transaccion-efectivo', async (req, res) => {
  const { periodo_id, tipo, monto, descripcion, fecha } = req.body;
  if (!periodo_id || !tipo || monto === undefined) {
    return res.status(400).json({ msg: 'periodo_id, tipo y monto son requeridos' });
  }
  if (!['deposito', 'retiro'].includes(tipo)) {
    return res.status(400).json({ msg: 'tipo debe ser deposito o retiro' });
  }
  try {
    const [result] = await db.query(
      `INSERT INTO TransaccionEfectivo (periodo_id, tipo, monto, descripcion, fecha)
       VALUES (?, ?, ?, ?, ?)`,
      [periodo_id, tipo, parseFloat(monto) || 0, descripcion || null, fecha || null]
    );
    res.status(200).json({ msg: "Transacción registrada satisfactoriamente", id: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Error al registrar la transacción' });
  }
});

router.put('/editar-transaccion-efectivo/:id', async (req, res) => {
  const { id } = req.params;
  const { tipo, monto, descripcion, fecha } = req.body;
  try {
    const fields = [];
    const values = [];
    if (tipo !== undefined) {
      if (!['deposito', 'retiro'].includes(tipo)) {
        return res.status(400).json({ msg: 'tipo debe ser deposito o retiro' });
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
    if (fields.length === 0) return res.status(400).json({ msg: 'No hay campos para actualizar' });
    await db.query(
      `UPDATE TransaccionEfectivo SET ${fields.join(', ')} WHERE id = ?`,
      [...values, id]
    );
    res.status(200).json({ msg: "Transacción actualizada satisfactoriamente" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Error al actualizar la transacción' });
  }
});

router.delete('/borrar-transaccion-efectivo/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await db.query('DELETE FROM TransaccionEfectivo WHERE id = ?', [id]);
    res.status(200).json({ msg: "Transacción borrada satisfactoriamente" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Error al borrar la transacción' });
  }
});

export default router;
