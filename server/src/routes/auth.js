import express from 'express';
import bcrypt from 'bcryptjs';
import db from '../database.js';

const router = express.Router();

router.post('/register', async (req, res) => {
  const { nombre, correo, pass } = req.body;

  try {
    const [existingUser] = await db.query('SELECT * FROM Usuario WHERE correo = ?', [correo]);
    if (existingUser.length > 0) {
      return res.status(400).json({ message: 'El usuario ya existe' });
    }

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

    res.status(201).json({ message: 'Usuario registrado exitosamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al registrar el usuario' });
  }
});

router.post('/login', async (req, res) => {
  const { correo, pass } = req.body;

  try {
    const [user] = await db.query('SELECT * FROM Usuario WHERE correo = ?', [correo]);
    if (user.length === 0) {
      return res.status(400).json({ message: 'Credenciales incorrectas' });
    }

    const validPassword = await bcrypt.compare(pass, user[0].pass);
    if (!validPassword) {
      return res.status(400).json({ message: 'Credenciales incorrectas' });
    }

    const { id, nombre, correo: correoUsuario, rol } = user[0];

    res.status(200).json({
      message: 'Inicio de sesión exitoso', usuario: { id, nombre, correo: correoUsuario, rol }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al iniciar sesión' });
  }
});

export default router;
