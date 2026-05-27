# AGENTS.md — PresupuestoProject

## Project structure

Two independent Node.js packages (no workspace manager):

| Directory | Role | Stack |
|-----------|------|-------|
| `presupuesto/` | Frontend (SPA) | React 18, Vite 6, react-router-dom 7, Tailwind CSS 3, ES Lint 9 flat config |
| `server/` | Backend (REST API) | Express 4, MySQL2 (pool), ESM, bcryptjs, nodemon |

No CI/CD, no Docker, no TypeScript, no test framework.

## Commands

```
# Frontend (presupuesto/)
npm run dev          # Vite dev server → localhost:5173
npm run build        # Production build → dist/
npm run lint         # ESLint 9 flat config
npm run preview      # Preview production build

# Backend (server/)
npm run dev          # nodemon, hot-restart on src/ changes (port :5000)
npm start            # node src/index.js
```

## Backend quirks

**Auto-route loading** (`server/src/index.js:13-25`):
Reads all `.js` files in `src/routes/` dynamically and mounts each `export default router` at `/`. Route paths must be globally unique.

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

**API client** (`presupuesto/src/api/client.js`): Hardcodes `API_URL = 'http://localhost:5000'`. No env variable for the backend URL.

**Admin panel** (`presupuesto/src/pages/AdminPanel.jsx`): Displays and updates `tasa_dolar` via `GET/PUT /config`.

**Styling**: Tailwind CSS (postcss plugin, `@tailwind` directives in `index.css`).

**ESLint**: `react/prop-types` turned off globally (`presupuesto/eslint.config.js:30`).

## Conventions

- ESM everywhere (`"type": "module"` in both `package.json`)
- No TypeScript — plain `.js` / `.jsx`
- Spanish/English mixed: code comments, route names, DB identifiers (Usuario, Metodo, descripcion, isFijo, es_efectivo, rol)
