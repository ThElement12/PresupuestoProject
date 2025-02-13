import express from "express";
import db from "../database.js";

const router = express.Router();


router.get('/mes-usuario/:IdUsuario', (req, res) => {
  const { IdUsuario } = req.params;
  db.query('SELECT * FROM Mes WHERE usuario_id = ?', [IdUsuario], (err, rows) => {
    if (!err) {
      res.json(rows);
    } else {
      console.error(err);
    }
  })
})

router.get('/mes/:id', (req, res) => {
  const { id } = req.params;
  db.query('SELECT * FROM Mes WHERE id = ?', [id], (err, rows) => {
    if (!err) {
      res.json(rows);
    } else {
      console.error(err);
    }
  })
})
router.post('/nuevo-mes', (req, res) => {
  const { id, porcentaje_gastos, porcentaje_gustos, porcentaje_ahorros } = req.body;

  var total = porcentaje_ahorros + porcentaje_gastos + porcentaje_gustos

  if (total !== 100) {
    return res.status(400).json({ msg:'Los porcentajes deben ser iguales a 100'})
  }
  db.query('INSERT INTO mes (usuario_id, porcentajeGastos, porcentajeGustos, porcentajeAhorros) VALUES (?, ?, ?, ?);', [id, porcentaje_gastos, porcentaje_gustos, porcentaje_ahorros], (err, rows) => {
    if (!err) {
      res.status(200).json({ msg: "Mes registrado satisfactoriamente" })
    } else {
      console.error(err);
    }
  })

})

export default router;