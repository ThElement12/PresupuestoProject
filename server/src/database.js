const mysql = require("mysql2");

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
});

db.connect((err) => {
  if (err) {
      console.error("Error al conectar a la base de datos:", err);
  } else {
      console.log("Conectado a la base de datos");
  }
});

export default db;