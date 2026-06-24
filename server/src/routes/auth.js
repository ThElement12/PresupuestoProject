import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';
import db from '../database.js';
import { JWT_SECRET } from '../middleware/auth.js';
import AppError from '../utils/AppError.js';
import asyncHandler from '../utils/asyncHandler.js';

const router = express.Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, message: 'Demasiados intentos. Intenta de nuevo en 15 minutos.', errorCode: 'RATE_LIMITED' },
  standardHeaders: true,
  legacyHeaders: false,
});

const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: { success: false, message: 'Demasiados registros. Intenta de nuevo en 1 hora.', errorCode: 'RATE_LIMITED' },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/register', registerLimiter, asyncHandler(async (req, res) => {
  const { nombre, correo, pass } = req.body;

  if (!nombre || typeof nombre !== 'string' || !nombre.trim()) {
    throw new AppError(400, 'Nombre es requerido', 'VALIDATION_ERROR');
  }
  if (!correo || typeof correo !== 'string' || !correo.trim()) {
    throw new AppError(400, 'Correo es requerido', 'VALIDATION_ERROR');
  }
  if (!pass || typeof pass !== 'string' || pass.length < 6) {
    throw new AppError(400, 'Contraseña debe tener al menos 6 caracteres', 'VALIDATION_ERROR');
  }

  const [existingUser] = await db.query('SELECT id FROM Usuario WHERE correo = ?', [correo.trim()]);
  if (existingUser.length > 0) {
    throw new AppError(409, 'El usuario ya existe', 'USER_EXISTS');
  }

  try {
    const [[{ count }]] = await db.query('SELECT COUNT(*) AS count FROM Usuario');
    const rol = count === 0 ? 'admin' : 'user';

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(pass, salt);

    const [result] = await db.query(
      'INSERT INTO Usuario (nombre, correo, pass, rol) VALUES (?, ?, ?, ?)',
      [nombre.trim(), correo.trim(), hashedPassword, rol]
    );

    await db.query(
      'INSERT INTO Metodo (usuario_id, metodo_pago, es_efectivo) VALUES (?, ?, ?)',
      [result.insertId, 'Efectivo', true]
    );
  } catch (error) {
    console.error(error);
    throw new AppError(500, 'Error al registrar el usuario', 'REGISTRATION_ERROR');
  }

  res.status(201).json({ success: true, message: 'Usuario registrado exitosamente' });
}));

router.post('/login', loginLimiter, asyncHandler(async (req, res) => {
  const { correo, pass } = req.body;

  if (!correo || typeof correo !== 'string' || !correo.trim()) {
    throw new AppError(400, 'Correo es requerido', 'VALIDATION_ERROR');
  }
  if (!pass || typeof pass !== 'string') {
    throw new AppError(400, 'Contraseña es requerida', 'VALIDATION_ERROR');
  }

  const [user] = await db.query('SELECT * FROM Usuario WHERE correo = ?', [correo.trim()]);
  if (user.length === 0) {
    throw new AppError(401, 'Usuario no encontrado', 'USER_NOT_FOUND');
  }

  const validPassword = await bcrypt.compare(pass, user[0].pass);
  if (!validPassword) {
    throw new AppError(401, 'Contraseña incorrecta', 'INVALID_PASSWORD');
  }

  const { id, nombre, correo: correoUsuario, rol } = user[0];
  const token = jwt.sign({ id, nombre, correo: correoUsuario, rol }, JWT_SECRET, { expiresIn: '30d' });

  res.status(200).json({
    success: true,
    message: 'Inicio de sesión exitoso',
    token,
    usuario: { id, nombre, correo: correoUsuario, rol }
  });
}));

export default router;
