import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";
import auth from "./middleware/auth.js";
import errorHandler from "./middleware/errorHandler.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:5176' }));
app.use(express.json({ limit: '10kb' }));

app.get("/", (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api', auth);

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
    process.exit(1);
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
