import express from "express";
import db from "../database.js";

const router = express.Router();


router.get('/quincena', (req, res) => {
  db.query('SELECT * FROM Quincena', (err, rows) => {
    if (!err) {
      res.json(rows);
    } else {
      console.error(err);
    }
  })
})

router.get('/quicena/:id', (req, res) => {
  const { id } = req.params;
  db.query('SELECT * FROM Quincena WHERE id = ?', [id], (err, rows) => {
    if (!err) {
      res.json(rows);
    } else {
      console.error(err);
    }
  })
})

router.post('/nueva-quincena', (req, res) => {
  const { id_mes, fecha_inicio, fecha_fin } = req.body;
  const inicio = new Date(fecha_inicio);
  const fin = new Date(fecha_fin);
  //TODO: VALIDAR QUE LA FECHA DE INICIO Y LA FECHA FIN SEAN 1 QUINCENA

  if (isNaN(inicio) || isNaN(fin)) {
    res.status(400).json({ error: "Fechas inválidas." });
  }
  db.query('INSERT INTO quincena (mes_id, fecha_inicio, fecha_fin) VALUES (?, ?, ?);', [id_mes, fecha_inicio, fecha_fin], (err, rows) => {
    if (!err) {
      res.status(200).json({ msg: "Quincena registrada satisfactoriamente" })
    } else {
      console.error(err);
    }
  })

})

export default router;