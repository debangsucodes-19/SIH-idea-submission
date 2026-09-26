# Strive — Fitness & Sports Performance Platform

Strive is a modular foundation for a personalized fitness and sports performance platform. Football is the first supported sport; the configuration is designed to grow to cricket, basketball, tennis, athletics and more.

## Phase 1 scope

This repository contains the runnable product foundation: a responsive React client, a separate Express API, centralized routing, reusable UI primitives, shared domain types, sport profiles and an API health endpoint. Feature screens remain clearly identified placeholders. There is no active authentication, database, pose analysis, camera, AI/ML, workout or diet generation, assessment logic, notifications service or trial discovery.

## Technology

- **Client:** React, TypeScript, Vite, Tailwind CSS v4, React Router and Lucide React
- **Server:** Node.js, Express, TypeScript and CORS
- **Future:** PostgreSQL, Google OAuth and MediaPipe Pose Landmarker are intentionally out of scope for this phase.

## Structure

```text
client/                  React application
  public/                Static assets
  src/components/        Navigation and reusable UI
  src/config/             Sport configuration
  src/layouts/            Public and dashboard layouts
  src/pages/              Landing, login and placeholder pages
  src/routes/             Central route configuration
  src/services/           API client
  src/types/              Frontend domain types
server/                  Independent Express API
  src/config/              Environment configuration
  src/controllers/         Request handlers
  src/middleware/          404 and error handling
  src/routes/              API routes
  src/app.ts               Express application
  src/server.ts            HTTP entry point
```

## Requirements

Node.js 20 or newer and npm.

## Install

From the repository root:

```bash
npm install
npm --prefix client install
npm --prefix server install
```

Copy the example environment files before running. On Windows PowerShell:

```powershell
Copy-Item client/.env.example client/.env
Copy-Item server/.env.example server/.env
```

On macOS/Linux:

```bash
cp client/.env.example client/.env
cp server/.env.example server/.env
```

## Run

Run both applications in separate terminals:

```bash
npm run dev:client
npm run dev:server
```

Or run both together (after installing root dependencies):

```bash
npm run dev
```

Open <http://localhost:5173>. The API listens at <http://localhost:5000>; its health endpoint is <http://localhost:5000/api/health>.

## Build

```bash
npm run build:client
npm run build:server
npm run build
```

## Environment variables

| File | Variable | Purpose |
|---|---|---|
| `client/.env.example` | `VITE_API_BASE_URL` | Base URL for the API service |
| `server/.env.example` | `PORT` | API listening port |
| `server/.env.example` | `NODE_ENV` | Runtime environment |
| `server/.env.example` | `CLIENT_URL` | Allowed browser origin for CORS |

Secrets and future-phase variables are not included. Keep real `.env` files out of version control.

## API

`GET /api/health` responds with:

```json
{ "success": true, "message": "Fitness Platform API is running" }
```

## Routes

`/` Landing · `/login` Login placeholder · `/onboarding` Onboarding placeholder · `/sports` Sport selection · `/dashboard` Overview · `/assessment` Assessment · `/workout` Workout · `/progress` Progress · `/diet` Nutrition · `/notifications` Notifications · `/profile` Profile · `/settings` Settings.

Future dashboard routes are accessible during Phase 1 and are not protected by authentication.

## Development phases

- **Phase 1 — Foundation:** project setup, presentation, routing, types, sport configuration and health endpoint.
- **Phase 2 — Identity and profiles:** Google OAuth and onboarding/profile persistence.
- **Later phases:** database-backed training, sports assessments, camera/pose analysis, AI recommendations, nutrition, notifications and discovery features.

No placeholder screen claims that future functionality is active.
