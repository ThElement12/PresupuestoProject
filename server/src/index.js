import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";
import errorHandler from "./middleware/errorHandler.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send(`Servidor funcionando. Conectado a la base de datos ${process.env.DB_NAME} en la URL ${process.env.DB_HOST}:${process.env.DB_PORT || 3306}`);
});

const loadRoutes = async () => {
  try {
    const routesPath = path.join(__dirname, "routes");
    const files = await fs.readdir(routesPath);

    for (const file of files) {
      const routePath = path.join(routesPath, file);
      const routeURL = pathToFileURL(routePath).href;
      const route = await import(routeURL);

      app.use('/api', route.default);
    }
  } catch (err) {
    console.error("Error al cargar las rutas:", err);
  }
};

await loadRoutes();

app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Recurso no encontrado', errorCode: 'NOT_FOUND' });
});

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
