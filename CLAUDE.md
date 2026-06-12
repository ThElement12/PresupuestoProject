# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

> Note: `AGENTS.md` also documents this repo in more detail (in Spanish/English). This file summarizes
> the same architecture and corrects a few CI/CD details (ports, DB credentials, nginx generation) that
> have changed since `AGENTS.md` was last updated — check both if something seems inconsistent.

## Project structure

Two independent Node.js packages (no workspace manager, no shared `node_modules`):

| Directory | Role | Stack |
|-----------|------|-------|
| `presupuesto/` | Frontend (SPA) | React 18, Vite 6, react-router-dom 7, Tailwind CSS 3, ESLint 9 flat config |
| `server/` | Backend (REST API) | Express 4, MySQL2 (`mysql2/promise` pool), ESM, bcryptjs, nodemon |

No TypeScript, no test framework. Code/identifiers mix Spanish and English (`Usuario`, `Metodo`,
`descripcion`, `isFijo`, `es_efectivo`, `rol`, etc.) — match existing naming when adding fields/routes.

## Commands

```bash
# Frontend (presupuesto/)
npm run dev          # Vite dev server, host mode -> http://localhost:5176
npm run build         # Production build -> dist/
npm run lint          # ESLint 9 flat config
npm run preview       # Preview production build

# Backend (server/)
npm run serve         # nodemon, hot-restart on src/ changes (port from .env, default 5000)
npm start             # node src/index.js
```

There is no test suite — "verify" means: backend starts without errors and the relevant `/api/...`
routes respond, and/or the frontend page renders/behaves correctly via the dev server.

## Backend architecture (`server/src/`)

**Auto-route loading** (`server/src/index.js`): on startup, reads every `.js` file in `src/routes/`
and mounts each `export default router` under `/api`. Route path strings therefore must be globally
unique across all route files (and each route already includes its own leading path, e.g.
`/login`, `/nuevo-mes`). Adding a new route file = adding a new feature module; no manual wiring needed.

**Database** (`server/src/database.js` + `server/db.sql`):
- `mysql2/promise` pool, configured from `DB_HOST`, `DB_USER`, `DB_PASS`, `DB_NAME` env vars.
  Note: the pool does **not** read a `DB_PORT` env var — it always connects on MySQL's default port 3306,
  even though some deploy configs set `DB_PORT=3307`.
- All queries use `await db.query(...)` (no callbacks, no `.promise()` wrapper).
- No migration tooling — schema lives entirely in `server/db.sql`, run manually / via Docker init.
- Core tables: `Usuario` (rol ENUM user/admin), `Configuracion` (key/value, holds `tasa_dolar`),
  `TipoMovimiento` (Ingreso/Gasto, seeded), `Metodo` (payment methods, `es_efectivo` flag),
  `Mes` (month, percentages for gastos/gustos/ahorros + `periodicidad`), `Periodo` (sub-period of a
  Mes, has `efectivo_inicial`), `TransaccionEfectivo` (deposito/retiro within a Periodo),
  `Movimiento` (the actual income/expense entries, dual currency `monto_usd`/`monto_rd`, `isFijo`,
  `pagado`).

**Auth** (`server/src/middleware/auth.js`, `server/src/middleware/admin.js`): no JWT/sessions.
`bcryptjs` compares password on `/login`; server returns `{ id, nombre, correo, rol }` as plain JSON.
The frontend re-sends that JSON as `Authorization: Bearer <JSON>`. The `auth` middleware just
`JSON.parse`s the bearer token into `req.usuario` (401 if missing/invalid) — it does **not**
verify a signature. `admin` middleware checks `req.usuario.rol === 'admin'`. Most routes do not
apply either middleware; `PUT /api/config` is the main example that uses both.
First user ever registered automatically gets `rol = 'admin'` (`server/src/routes/auth.js`).

**Money/currency conversion**: `Movimiento` rows store both `monto_usd` and `monto_rd`. Dashboard
(`server/src/routes/dashboard.js`) and movimiento routes compute `totalRD = monto_rd + monto_usd * tasa_dolar`,
where `tasa_dolar` is the single global value in `Configuracion`.

**Fixed/recurring movements** (`server/src/routes/mes.js`): `POST /nuevo-mes` creates a `Mes`,
generates its `Periodo`s based on `periodicidad` (`mensual` | `quincenal` | `semanal`, see
`generatePeriods`), then for each new period calls `propagateFixedMovements`, which copies any
`Movimiento` rows with `isFijo = 1` from the *corresponding period index* of the user's previous
`Mes`, resetting `pagado = false`.

**Payment methods** (`server/src/routes/metodo.js`): a row with `metodo_pago = 'Efectivo'`,
`es_efectivo = true` is auto-created on user registration (`auth.js`). Deletion
(`DELETE /borrar_metodo/:id`) explicitly filters `WHERE es_efectivo = false`, so the Efectivo
method can never be removed.

**Env**: requires `server/.env` (see `.env.example` at repo root for the variable names: `PORT`,
`DB_HOST`, `DB_USER`, `DB_PASS`, `DB_NAME`). `PORT` defaults to 5000 if unset.

## Frontend architecture (`presupuesto/src/`)

**Routing** (`App.jsx`): `react-router-dom` v7 with `BrowserRouter`. `ProtectedRoute` gates
authenticated routes by checking `localStorage.getItem('usuario')`. `AdminRoute` additionally
checks `usuario.rol === 'admin'`. Routes: `/login`, `/register`, `/dashboard`, `/mes/nuevo`,
`/mes/:id`, `/metodos`, `/metodo/nuevo`, `/admin`; unknown paths and `/` redirect to `/dashboard`.

**Auth** (`context/AuthContext.jsx`): `AuthProvider` stores the full login-response user object
(including `rol`) as `localStorage.usuario`. There is no real token — that stored JSON is what
gets sent back as the `Authorization: Bearer <...>` header by the API client.

**API client** (`api/client.js`):
- `API_URL = import.meta.env.VITE_API_URL !== undefined ? import.meta.env.VITE_API_URL : 'http://localhost:5000'`.
  This means an **empty string** `VITE_API_URL=""` (used in production so nginx proxies same-origin)
  is honored as-is — only a *fully unset* `VITE_API_URL` falls back to `http://localhost:5000`.
- Every request is prefixed with `/api`; `api.*` methods map 1:1 to backend routes (login, register,
  config, dashboard, mes/periodo/movimiento/metodo/transaccion-efectivo CRUD).

**Admin panel** (`pages/AdminPanel.jsx`): reads/writes the global `tasa_dolar` via `GET`/`PUT /api/config`.

**Styling**: Tailwind CSS via PostCSS (`@tailwind` directives in `src/index.css`).

**ESLint**: `react/prop-types` and `react/jsx-no-target-blank` are turned off globally
(`presupuesto/eslint.config.js`).

## Docker

Multi-file Docker Compose pattern; requires Docker + Docker Compose.

| File | Purpose |
|------|---------|
| `docker-compose.yml` | Base/production services (mysql, backend, frontend) |
| `docker-compose.override.yml` | Auto-loaded in dev: Vite dev server on 5176 with HMR, nodemon backend, exposed MySQL port 3307 |
| `docker-compose.staging.yml` | Staging overrides (separate DB name/volume, empty `VITE_API_URL`) |
| `docker-compose.deploy.yml` | Pulls prebuilt Docker Hub images instead of building locally |

Copy `.env.example` to `.env` at repo root and set `MYSQL_ROOT_PASSWORD`, `DB_USER`, `DB_PASS`,
`DB_NAME`, `VITE_API_URL` before running `docker compose up`.

- `server/db.sql` is mounted into MySQL's `docker-entrypoint-initdb.d/` and runs automatically on
  first container start (volume `mysql_data`, or `mysql_staging_data` for staging).
- The checked-in `presupuesto/nginx.conf` proxies `/api/` to `http://host.docker.internal:5000/api/`
  (used for local Docker builds); in CI this file is **overwritten** per-branch (see below).

## CI/CD (Jenkins + Docker Hub -> unRAID)

`Jenkinsfile` builds, pushes to Docker Hub (images `thelement012/presupuesto-{backend,frontend}`),
and deploys via `docker run` to an unRAID host (`IP_UNRAID = 192.168.100.3`). Only `main`,
`staging`, and `production` branches run the pipeline.

| Branch | Backend host port | Frontend host port | DB name suffix | `VITE_API_URL` (build arg) |
|--------|-------------------|---------------------|-----------------|------------------------------|
| `production` | 5003 | 6969 | *(none)* | `""` (same-origin via nginx) |
| `staging` | 5004 | 6971 | `_staging` | `http://192.168.100.3:5004` |
| `main` | 5005 | 6970 | `_dev` | `http://192.168.100.3:5005` |

Per-pipeline-run details:
- **Init Database** stage runs against a `taller-mariadb` container (`mariadb -u admin -padminpassword`),
  creates `presupuesto_mensual<suffix>` if missing, and loads schema via
  `tail -n +3 server/db.sql | docker exec -i taller-mariadb mariadb ...` (skips the first two lines
  of `db.sql`, which are comments).
- **Build & Tag** stage tags images as `:<branch>`, `:<build-number>`, and `:latest`, and *generates*
  `presupuesto/nginx.conf` from a template with `proxy_pass http://host.docker.internal:<backendPort>/api/;`
  before building the frontend image — the file checked into git (port 5000) is only the local-dev default.
- **Deploy** stage runs containers named `presupuesto-backend-<branch>` / `presupuesto-frontend-<branch>`,
  passing the backend `DB_HOST=192.168.100.3`, `DB_PORT=3307`, `DB_USER=admin`, `DB_PASS=adminpassword`,
  `DB_NAME=presupuesto_mensual<suffix>`, `PORT=5000` (mapped to the table's backend port), and the
  frontend mapped to the table's frontend port with `--add-host host.docker.internal:host-gateway`.

Docker Hub credential ID in Jenkins: `dockerhub-creds`.
