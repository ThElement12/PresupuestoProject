import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const loadRoutes = async () => {
  try {
    const routesPath = path.join(__dirname, "routes");
    const files = await fs.readdir(routesPath);

    for (const file of files) {
      const routePath = path.join(routesPath, file);
      const routeURL = pathToFileURL(routePath).href;
      const route = await import(routeURL);

      app.use(route.default); 
    }
  } catch (err) {
    console.error("Error al cargar las rutas:", err);
  }
};

loadRoutes();

app.get("/", (req, res) => {
  res.send("Servidor funcionando");
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
