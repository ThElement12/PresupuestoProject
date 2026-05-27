import express from "express";
import db from "../database.js";

const router = express.Router();

router.get('/tipo-movimiento', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM TipoMovimiento');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Error al obtener tipos' });
  }
});

router.get('/movimiento/:id_periodo', async (req, res) => {
  const { id_periodo } = req.params;
  try {
    const [[{ valor }]] = await db.query("SELECT valor FROM Configuracion WHERE clave = 'tasa_dolar'");
    const tasa = parseFloat(valor) || 0;

    const [rows] = await db.query(
      `SELECT m.*, tm.movimiento AS tipo, mt.metodo_pago, mt.es_efectivo
       FROM Movimiento m
       JOIN TipoMovimiento tm ON m.tipoMovimiento_id = tm.id
       JOIN Metodo mt ON m.metodo_id = mt.id
       WHERE m.periodo_id = ?`,
      [id_periodo]
    );

    const enriquecidos = rows.map((m) => ({
      ...m,
      totalRD: parseFloat(m.monto_rd) + parseFloat(m.monto_usd) * tasa,
    }));

    res.json(enriquecidos);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Error al obtener movimientos' });
  }
});

router.post('/nuevo_movimiento', async (req, res) => {
  const { tipoMovimiento_id, periodo_id, metodo_id, descripcion, isFijo, monto_usd, monto_rd, fecha_pago, pagado } = req.body;
  try {
    const [result] = await db.query(
      `INSERT INTO Movimiento (tipoMovimiento_id, periodo_id, metodo_id, descripcion, isFijo, monto_usd, monto_rd, fecha_pago, pagado)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [tipoMovimiento_id, periodo_id, metodo_id, descripcion, isFijo, monto_usd || 0, monto_rd || 0, fecha_pago || null, pagado || false]
    );
    res.status(200).json({ msg: "Movimiento registrado satisfactoriamente", id: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Error al registrar el movimiento' });
  }
});

router.put('/editar_movimiento/:id', async (req, res) => {
  const { id } = req.params;
  const { tipoMovimiento_id, periodo_id, metodo_id, descripcion, isFijo, monto_usd, monto_rd, fecha_pago, pagado } = req.body;
  try {
    await db.query(
      `UPDATE Movimiento SET tipoMovimiento_id = ?, periodo_id = ?, metodo_id = ?, descripcion = ?, isFijo = ?, monto_usd = ?, monto_rd = ?, fecha_pago = ?, pagado = ? WHERE id = ?`,
      [tipoMovimiento_id, periodo_id, metodo_id, descripcion, isFijo, monto_usd || 0, monto_rd || 0, fecha_pago || null, pagado || false, id]
    );
    res.status(200).json({ msg: "Movimiento actualizado satisfactoriamente" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Error al actualizar el movimiento' });
  }
});

router.delete('/borrar_movimiento/:id_movimiento', async (req, res) => {
  const { id_movimiento } = req.params;
  try {
    await db.query('DELETE FROM Movimiento WHERE id = ?', [id_movimiento]);
    res.status(200).json({ msg: "Movimiento borrado satisfactoriamente" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Error al borrar el movimiento' });
  }
});

export default router;
