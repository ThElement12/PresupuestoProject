import express from 'express';
import db from '../database.js';
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

router.put('/config', admin, asyncHandler(async (req, res) => {
  const { tasa_dolar } = req.body;

  const parsed = parseFloat(tasa_dolar);
  if (tasa_dolar === undefined || isNaN(parsed) || parsed <= 0) {
    throw new AppError(400, 'tasa_dolar debe ser un número positivo', 'VALIDATION_ERROR');
  }

  await db.query(
    "UPDATE Configuracion SET valor = ? WHERE clave = 'tasa_dolar'",
    [String(parsed)]
  );
  res.json({ msg: 'Configuración actualizada', tasa_dolar: parsed });
}));

export default router;
