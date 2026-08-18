# Training App Shell

A monorepo starting point for feature development: a NestJS backend and a Next.js frontend, wired together and ready to build on.

## Stack

- **Backend** — NestJS 11 (TypeScript), served under `/api`
- **Frontend** — Next.js 16 (App Router, TypeScript, Tailwind CSS)
- **Monorepo** — pnpm workspaces
- **Node** — 20+ required (22 recommended)

## Layout

```
training-app-shell/
├── apps/
│   ├── backend/     # NestJS API
│   └── frontend/    # Next.js app
├── package.json     # workspace root + scripts
└── pnpm-workspace.yaml
```

## Getting started

Install dependencies from the repo root (installs both apps):

```bash
pnpm install
```

Run both apps together:

```bash
pnpm dev
```

- Frontend: http://localhost:3000
- Backend:  http://localhost:3001/api

The frontend proxies any `/api/*` request to the backend, so from the browser you can just call `/api/...` — no CORS setup needed in development.

## Verifying it works

With both servers running:

```bash
curl http://localhost:3000/api/health
```

Expected response:

```json
{ "status": "ok", "timestamp": "..." }
```

This request hits the frontend (port 3000) and is proxied to the backend (port 3001), confirming both apps and the proxy are working.

## Scripts (run from the repo root)

| Command | What it does |
|---|---|
| `pnpm dev` | Runs backend and frontend together |
| `pnpm build` | Builds both apps for production |
| `pnpm test` | Runs the backend test suite |

## Where to build

- **Backend** — add feature modules under `apps/backend/src/`. The `/api/health` endpoint (`app.controller.ts` + `app.service.ts`) is a working reference for the controller → service pattern.
- **Frontend** — add pages and components under `apps/frontend/src/`. Call the backend with `fetch('/api/...')`; the proxy handles the rest.
