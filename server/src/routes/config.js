import express from 'express';
import db from '../database.js';
import auth from '../middleware/auth.js';
import admin from '../middleware/admin.js';

const router = express.Router();

router.get('/config', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT clave, valor FROM Configuracion');
    const config = {};
    for (const row of rows) {
      config[row.clave] = row.valor;
    }
    res.json(config);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Error al obtener configuración' });
  }
});

router.put('/config', auth, admin, async (req, res) => {
  const { tasa_dolar } = req.body;

  if (tasa_dolar === undefined || isNaN(parseFloat(tasa_dolar))) {
    return res.status(400).json({ msg: 'tasa_dolar debe ser un número válido' });
  }

  try {
    await db.query(
      "UPDATE Configuracion SET valor = ? WHERE clave = 'tasa_dolar'",
      [String(tasa_dolar)]
    );
    res.json({ msg: 'Configuración actualizada', tasa_dolar: parseFloat(tasa_dolar) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Error al actualizar configuración' });
  }
});

export default router;
