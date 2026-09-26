# Strive — Fitness & Sports Performance Platform

Strive is a modular platform for personalized fitness and sports performance. Football is the first supported sport; the sport configuration is designed to grow to cricket, basketball, tennis, athletics and more.

## Current phases

### Phase 1 — Foundation

Responsive React client, Express API, centralized routing, reusable UI, domain types, sport profiles and API health endpoint.

### Phase 2 — Identity and profiles

Google OAuth sign-in, signed HTTP-only session cookies, PostgreSQL-backed user records, protected dashboard routes, onboarding, profile persistence and sign-out.

AI/pose analysis, camera access, training generation, assessments, nutrition recommendations, notifications and sports-trial discovery remain future phases. Their screens do not claim to provide those features yet.

## Technology

- **Client:** React, TypeScript, Vite, Tailwind CSS v4, React Router and Lucide React
- **Server:** Node.js, Express, TypeScript, Google Auth Library and PostgreSQL (`pg`)
- **Database:** PostgreSQL; the server creates the Phase 2 user/profile tables at startup.

## Structure

```text
client/                    React application
  src/components/          Navigation and reusable UI
  src/config/               Sport configuration
  src/hooks/                Authentication state
  src/layouts/              Public and dashboard layouts
  src/pages/                Landing, login, onboarding and profile pages
  src/routes/               Central routes and auth guard
  src/services/             API client
  src/types/                Frontend domain types
server/                    Independent Express API
  src/config/                Environment and PostgreSQL setup
  src/controllers/           OAuth, profile and health handlers
  src/middleware/            Authentication and error handling
  src/routes/                API routes
  src/app.ts                 Express application
  src/server.ts              HTTP entry point
```

## Requirements and install

Use Node.js 20 or newer, npm and PostgreSQL.

From the repository root:

```bash
npm install
npm --prefix client install
npm --prefix server install
```

Copy the example environment files. In Windows PowerShell:

```powershell
Copy-Item client/.env.example client/.env
Copy-Item server/.env.example server/.env
```

On macOS/Linux:

```bash
cp client/.env.example client/.env
cp server/.env.example server/.env
```

## Configure Phase 2 sign-in

1. Create a PostgreSQL database named `fitness_platform`.
2. In `server/.env`, set `DATABASE_URL` to its connection string and replace the `SESSION_SECRET` example with a random secret of at least 32 characters.
3. Create a Google OAuth **Web application** client. Add `http://localhost:5173` as an authorized JavaScript origin and `http://localhost:5000/api/auth/google/callback` as an authorized redirect URI.
4. Put the resulting client ID and secret in `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` in `server/.env`. Keep `.env` files private and out of Git.

The server creates the `users` and `user_profiles` tables when it starts. Google sign-in is disabled until the OAuth credentials, PostgreSQL connection and session secret are configured. Without those values, the client and API still start, and the login screen explains what is missing.

## Run locally

From the repository root:

```bash
npm run dev
```

Open <http://localhost:5173>. The API listens on <http://localhost:5000> and its health endpoint is <http://localhost:5000/api/health>.

Run either service separately with `npm run dev:client` or `npm run dev:server`.

## Build

```bash
npm run build:client
npm run build:server
npm run build
```

## Environment variables

| File | Variable | Purpose |
|---|---|---|
| `client/.env.example` | `VITE_API_BASE_URL` | API base URL |
| `server/.env.example` | `PORT` | API listening port |
| `server/.env.example` | `NODE_ENV` | Runtime environment; enables secure cookies in production |
| `server/.env.example` | `CLIENT_URL` | Allowed browser origin and OAuth return destination |
| `server/.env.example` | `DATABASE_URL` | PostgreSQL connection string |
| `server/.env.example` | `GOOGLE_CLIENT_ID` | Google OAuth web client ID |
| `server/.env.example` | `GOOGLE_CLIENT_SECRET` | Google OAuth client secret |
| `server/.env.example` | `GOOGLE_CALLBACK_URL` | OAuth callback registered with Google |
| `server/.env.example` | `SESSION_SECRET` | At least 32 characters for signing session cookies |

## Routes and API

Public pages: `/` and `/login`. Sign-in and profile routes are protected: `/onboarding`, `/sports`, `/dashboard`, `/assessment`, `/workout`, `/progress`, `/diet`, `/notifications`, `/profile` and `/settings`.

The API includes `GET /api/health`, `GET /api/auth/status`, Google OAuth start/callback, `GET /api/auth/me`, `POST /api/auth/logout` and authenticated `PUT /api/profile`.

## Next phases

Phase 2 covers identity and basic profile persistence. Future work can add assessment logic, sport-specific training, camera-based pose analysis, recommendations, nutrition, notifications and discovery features.
