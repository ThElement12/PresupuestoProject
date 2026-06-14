import express from 'express';
import db from '../database.js';
import auth from '../middleware/auth.js';
import admin from '../middleware/admin.js';
import AppError from '../utils/AppError.js';
import asyncHandler from '../utils/asyncHandler.js';

const router = express.Router();

router.get('/config', asyncHandler(async (req, res) => {
  const [rows] = await db.query('SELECT clave, valor FROM Configuracion');
  const config = {};
  for (const row of rows) {
    config[row.clave] = row.valor;
  }
  res.json(config);
}));

router.put('/config', auth, admin, asyncHandler(async (req, res) => {
  const { tasa_dolar } = req.body;

  if (tasa_dolar === undefined || isNaN(parseFloat(tasa_dolar))) {
    throw new AppError(400, 'tasa_dolar debe ser un número válido', 'VALIDATION_ERROR');
  }

  await db.query(
    "UPDATE Configuracion SET valor = ? WHERE clave = 'tasa_dolar'",
    [String(tasa_dolar)]
  );
  res.json({ msg: 'Configuración actualizada', tasa_dolar: parseFloat(tasa_dolar) });
}));

export default router;
