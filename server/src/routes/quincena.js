import express from "express";
import db from "../database.js";

const router = express.Router();


router.get('/quincena', (req, res) => {
  db.query('SELECT * FROM Quincena', (err, rows) => {
    if(!err){
      res.json(rows);
    }else{
      console.error(err);
    }
  })
})

router.get('/quicena/:id', (req,res) => {
  const {id} = req.params;
  db.query('SELECT * FROM Quincena WHERE id = ?',[id], (err, rows) => {
    if(!err){
      res.json(rows);
    }else{
      console.error(err);
    }
  })
})

export default router;