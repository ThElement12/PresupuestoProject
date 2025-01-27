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

export default router;