# AGENTS.md — PresupuestoProject

## Project structure

Two independent Node.js packages (no workspace manager):

| Directory | Role | Stack |
|-----------|------|-------|
| `presupuesto/` | Frontend (SPA) | React 18, Vite 6, react-router-dom 7, Tailwind CSS 3, ES Lint 9 flat config |
| `server/` | Backend (REST API) | Express 4, MySQL2 (pool), ESM, bcryptjs, nodemon |

No TypeScript, no test framework.

## CI/CD (Jenkins + Docker Hub)

Pipeline en Jenkins (`Jenkinsfile`) que construye, pushea a Docker Hub y despliega en unRAID vía `docker run`.

| Rama | Puerto backend | Puerto frontend | DB suffix |
|------|---------------|----------------|-----------|
| `main` | 5001 | 6970 | `_dev` |
| `staging` | 5002 | 6971 | `_staging` |
| `production` | 5000 | 6969 | `""` |

Credencial de Jenkins: `dockerhub-creds` (Username with password).

## Docker

3 entornos con Docker Compose (multi-file pattern). Requiere Docker y Docker Compose instalados.

### Archivos

| Archivo | Ambiente |
|---------|----------|
| `docker-compose.yml` | Producción (base) |
| `docker-compose.override.yml` | Dev (se auto-carga en `docker compose up`) |
| `docker-compose.staging.yml` | Staging |

### Variables de entorno

Copiar `.env.example` a `.env` en la raíz del proyecto y ajustar valores:

```
MYSQL_ROOT_PASSWORD=...
DB_USER=root
DB_PASS=...
DB_NAME=presupuesto_mensual
VITE_API_URL=http://localhost:5000
```

### Uso

```bash
# === DEV (main branch) ===
docker compose up
# Frontend: http://localhost:5176 (Vite HMR)
# Backend:  http://localhost:5000/api/...
# MySQL:    localhost:3307

# === STAGING ===
docker compose -f docker-compose.yml -f docker-compose.staging.yml up -d
# Frontend: http://<host>:6969 (Nginx, built)
# Backend:  interno (solo vía frontend)

# === PRODUCCIÓN ===
docker compose -f docker-compose.yml up -d
# Frontend: https://budget.joseph-cloud.com (Nginx, built)
# Backend:  interno
```

### Rebuildear imágenes

```bash
docker compose build     # rebuildear todo
docker compose up -d     # levantar con imágenes nuevas
docker compose down      # detener todo (no borra volúmenes)
docker compose down -v   # detener y borrar volúmenes (¡cuidado! borra datos MySQL)
```

### Servicios

| Servicio | Puerto host | Puerto interno | Imagen |
|----------|-------------|----------------|--------|
| `mysql` | 3307 (solo dev) | 3306 | mysql:8 |
| `backend` | — | 5000 | build ./server |
| `frontend` | 6969 | 80 | build ./presupuesto |

### Notas Docker

- **MySQL**: El volumen `mysql_data` persiste la base. En staging usa `mysql_staging_data`. El archivo `server/db.sql` se ejecuta automáticamente al primer inicio.
- **Nginx**: Sirve el frontend build y proxy reversa `/api/*` → `host.docker.internal:5000/api/*` (resuelve al host desde el contenedor via `--add-host` o `extra_hosts`). Sin CORS porque todo corre en el mismo origen.
- **Dev frontend**: Usa Vite dev server con HMR en puerto 5176. Los archivos `src/`, `index.html`, `vite.config.js`, etc. se montan como volúmenes.
- **Dev backend**: Usa nodemon con el directorio `src/` montado como volumen.
- **Dominio producción**: `budget.joseph-cloud.com` — Cloudflare Tunnel apunta a `localhost:6969`.

## Commands (sin Docker)

```
# Frontend (presupuesto/)
npm run dev          # Vite dev server → localhost:5176 (5173 anterior)
npm run build        # Production build → dist/
npm run lint         # ESLint 9 flat config
npm run preview      # Preview production build

# Backend (server/)
npm run serve        # nodemon, hot-restart on src/ changes (port :5000)
npm start            # node src/index.js
```

## Backend quirks

**Auto-route loading** (`server/src/index.js:13-25`):
Reads all `.js` files in `src/routes/` dynamically and mounts each `export default router` at `/api/`. Route paths must be globally unique (prefixed with `/api`).

**Database** (`server/db.sql`):
- MySQL, database name `presupuesto_mensual`
- `mysql2/promise` pool via `server/src/database.js` consuming env vars `DB_HOST`, `DB_USER`, `DB_PASS`, `DB_NAME`
- All queries use `await db.query(...)` — no callback pattern, no `.promise()` wrapper
- No migration tooling — run `db.sql` manually

**Auth**: No JWT/sessions. `bcryptjs` compare on login; server returns `{ id, nombre, correo, rol }` in plain JSON. First registered user auto-gets `rol='admin'`. `Authorization: Bearer <JSON>` sent by frontend but not validated server-side (middleware available in `server/src/middleware/`).

**Admin**: `rol ENUM('user','admin')` on `Usuario` table. Global `tasa_dolar` stored in `Configuracion` table, managed via `PUT /config` (requires auth + admin middleware).

**Movements**: Dual currency — `monto_usd` and `monto_rd` columns. Dashboard and API endpoints convert USD→RD$ using global `tasa_dolar` and return `totalRD` in responses.

**Fixed movements** (`server/src/routes/mes.js`): On `/nuevo-mes`, `isFijo=1` movements propagate from previous month's corresponding period, carrying over `monto_usd`, `monto_rd`, `fecha_pago` with `pagado=false`.

**Payment methods**: `Metodo` table has `es_efectivo BOOLEAN`. "Efectivo" auto-created on user registration; protected from deletion server-side (`WHERE es_efectivo = false`).

**Env**: Requires `.env` in `server/` root (`.env.example` lists keys). `PORT` defaults to 5000.

## Frontend quirks

**Routing** (`presupuesto/src/App.jsx`): `react-router-dom` with `BrowserRouter`. Protected routes via `ProtectedRoute` (checks `localStorage.getItem('usuario')`). Admin-only routes via `AdminRoute` (checks `usuario.rol === 'admin'`). Routes: `/login`, `/register`, `/dashboard`, `/mes/nuevo`, `/mes/:id`, `/periodo/:id`, `/metodos`, `/metodo/nuevo`, `/admin`.

**Auth** (`presupuesto/src/context/AuthContext.jsx`): Stores full user JSON (including `rol`) as `localStorage.usuario`. No real token — the login response object is saved as-is and sent as Bearer token.

**API client** (`presupuesto/src/api/client.js`): Usa `import.meta.env.VITE_API_URL` (fallback `http://localhost:5000`). Aplica prefijo `/api` automáticamente a los endpoints.

**Admin panel** (`presupuesto/src/pages/AdminPanel.jsx`): Displays and updates `tasa_dolar` via `GET/PUT /config`.

**Styling**: Tailwind CSS (postcss plugin, `@tailwind` directives in `index.css`).

**ESLint**: `react/prop-types` turned off globally (`presupuesto/eslint.config.js:30`).

## Conventions

- ESM everywhere (`"type": "module"` in both `package.json`)
- No TypeScript — plain `.js` / `.jsx`
- Spanish/English mixed: code comments, route names, DB identifiers (Usuario, Metodo, descripcion, isFijo, es_efectivo, rol)
