import express from "express";
import db from "../database.js";

const router = express.Router();

//Obtener todos los periodos de un mes en especifico
router.get('/periodo/:id_mes', (req, res) => {
  const {id_mes} = req.params;
  db.query('SELECT * FROM Periodo WHERE mes_id = ?', [id_mes], (err, rows) => {
    if (!err) {
      res.json(rows);
    } else {
      console.error(err);
    }
  })
})

//Registrar un nuevo periodo en el mes
router.post('/nuevo_periodo', (req, res) => {
  const { id_mes, tasa_dolar, fecha_inicio, fecha_fin } = req.body;
  const inicio = new Date(fecha_inicio);
  const fin = new Date(fecha_fin);

  if (isNaN(inicio) || isNaN(fin)) {
    res.status(400).json({ error: "Fechas inválidas." });
  }
  db.query('INSERT INTO Periodo (mes_id, tasa_dolar, fecha_inicio, fecha_fin) VALUES (?, ?, ?, ?);', [id_mes, tasa_dolar, fecha_inicio, fecha_fin], (err, rows) => {
    if (!err) {
      res.status(200).json({ msg: "Periodo registrado satisfactoriamente" })
    } else {
      console.error(err);
    }
  })
})

export default router;