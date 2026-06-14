import express from 'express';
import bcrypt from 'bcryptjs';
import db from '../database.js';
import AppError from '../utils/AppError.js';
import asyncHandler from '../utils/asyncHandler.js';

const router = express.Router();

router.post('/register', asyncHandler(async (req, res) => {
  const { nombre, correo, pass } = req.body;

  const [existingUser] = await db.query('SELECT * FROM Usuario WHERE correo = ?', [correo]);
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
      [nombre, correo, hashedPassword, rol]
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

router.post('/login', asyncHandler(async (req, res) => {
  const { correo, pass } = req.body;

  const [user] = await db.query('SELECT * FROM Usuario WHERE correo = ?', [correo]);
  if (user.length === 0) {
    throw new AppError(401, 'Usuario no encontrado', 'USER_NOT_FOUND');
  }

  const validPassword = await bcrypt.compare(pass, user[0].pass);
  if (!validPassword) {
    throw new AppError(401, 'Contraseña incorrecta', 'INVALID_PASSWORD');
  }

  const { id, nombre, correo: correoUsuario, rol } = user[0];

  res.status(200).json({
    success: true,
    message: 'Inicio de sesión exitoso',
    usuario: { id, nombre, correo: correoUsuario, rol }
  });
}));

export default router;
