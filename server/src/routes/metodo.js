import express from "express";
import db from "../database.js";

const router = express.Router();

router.get('/metodo/:usuario_id', (req, res) => {
  const {usuario_id} = req.params

  db.query('SELECT * FROM Metodo WHERE usuario_id = ?', [usuario_id], (err, rows) => {
    if (!err) {
      res.json(rows);
    } else {
      console.error(err);
    }
  })

})

router.post('/nuevo_metodo', (req, res) => {
  const {usuario_id, metodo_pago} = req.body

  db.query('INSERT INTO Metodo (usuario_id, metodo_pago) VALUES (?, ?);', [usuario_id, metodo_pago], (err, rows) => {
    if (!err) {
      res.status(200).json({ msg: "Método registrado satisfactoriamente" })
    } else {
      console.error(err);
    }
  })
})


router.delete('/borrar_metodo/:id_metodo', (req, res) => {
  const { id_metodo } = req.params 
  db.query('DELETE FROM Metodo WHERE id = ?', [id_metodo], (err, rows) => {
    if (!err) {
      res.status(200).json({ msg: "Método borrado satisfactoriamente" })
    } else {
      console.error(err)
    }
  })
})

export default router;
