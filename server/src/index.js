const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const fs = require('fs');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

fs.readdir('./src/routes', (err, files) => {
  if(err){
    console.error(err);
    return
  }else{
    files.forEach(file => {
      path = './src/routes/'+ file;
      app.use(require(path))
    });
  }
});

app.get("/", (req, res) => {
    res.send("Servidor funcionando");
});

app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});