import express from 'express';
import bcrypt from 'bcryptjs';
import db from '../database.js';

const router = express.Router();

//Registrar nuevo usuario
router.post('/register', async (req, res) => {
  const { nombre, correo, pass } = req.body;

  try {
    const [existingUser] = await db.promise().query('SELECT * FROM Usuario WHERE correo = ?', [correo]);
    if (existingUser.length > 0) {
      return res.status(400).json({ message: 'El usuario ya existe' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(pass, salt);

    await db.promise().query('INSERT INTO Usuario (nombre, correo, pass) VALUES (?, ?, ?)', [nombre, correo, hashedPassword]);
    res.status(201).json({ message: 'Usuario registrado exitosamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al registrar el usuario' });
  }
});

//Loguearse un nuevo usuario
router.post('/login', async (req, res) => {
  const { correo, pass } = req.body;

  try {
    const [user] = await db.promise().query('SELECT * FROM Usuario WHERE correo = ?', [correo]);
    if (user.length === 0) {
      return res.status(400).json({ message: 'Credenciales incorrectas' });
    }

    const validPassword = await bcrypt.compare(pass, user[0].pass);
    if (!validPassword) {
      return res.status(400).json({ message: 'Credenciales incorrectas' });
    }

    const { id, nombre, correo_usuario } = user[0];

    res.status(200).json({
      message: 'Inicio de sesión exitoso', usuario: {
        id,
        nombre,
        correo_usuario
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al iniciar sesión' });
  }
});


export default router;
