import express from "express";
import db from "../database.js";

const router = express.Router();

//Obtener los tipos de movimiento del sistema
router.get('/tipo-movimiento', (req, res) => {
  db.query('SELECT * FROM TipoMovimiento', (err, rows) => {
    if (!err) {
      res.json(rows)
    } else {
      console.error(err);
    }
  })
})

//Obtener los movimientos de un periodo especifico
router.get('/movimiento/:id_periodo', (req, res) => {
  const { id_periodo } = req.params;
  db.query('SELECT * FROM Movimiento WHERE periodo_id = ?', [id_periodo], (err, rows) => {
    if (!err) {
      res.json(rows)
    } else {
      console.error(err)
    }
  })
})

//Agregar un nuevo movimiento
router.post('/nuevo_movimiento', (req, res) => {
  const { tipoMovimiento_id, periodo_id, metodo_id, descripcion, isFijo, cantidad, dolar } = req.body;

  db.query('INSERT INTO Movimiento (tipoMovimiento_id, periodo_id, metodo_id, descripcion, isFijo, cantidad, dolar) VALUES (?, ?, ?, ?, ?, ?, ?)', [tipoMovimiento_id, periodo_id, metodo_id, descripcion, isFijo, cantidad, dolar], (err, rows) => {
    if (!err) {
      res.status(200).json({ msg: "Movimiento registrado satisfactoriamente" })
    } else {
      console.error(err);
    }
  })

})
//Borrar un movimiento
router.delete('/borrar_movimiento/:id_movimiento', (req, res) => {
  const { id_movimiento } = req.params

  db.query('DELETE FROM Movimiento WHERE id = ?', [id_movimiento], (err, rows) => {
    if (!err) {
      res.status(200).json({ msg: "Movimiento borrado satisfactoriamente" })
    } else {
      console.error(err)
    }
  })

})

export default router;
