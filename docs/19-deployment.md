# Deployment & Infrastructure Plan

This document outlines deployment configurations, platform targets, and runtime environment settings.

## 1. Platform Target: Railway
We deploy the monorepo to **Railway** as a unified Next.js build.
* **Root Build Detection**: Railway detects the workspace, and uses the root `package.json` start script (`pnpm --filter @nocap/web build` and `pnpm --filter @nocap/web start`) to run the frontend and API routes.
* **Database**: Managed Supabase / Postgres instance.
* **No Background Worker Daemon**: Elimination of standalone workers and Redis nodes reduces monthly infrastructure footprint and costs.

## 2. Environment Variables Settings

The following variables must be configured on the Railway deployment target:

| Variable | Description |
|---|---|
| `NODE_ENV` | Mode setting (`production` / `development`) |
| `HELIUS_API_KEY` | Helius API credentials for Solana RPC query fallbacks |
| `DATABASE_URL` | PostgreSQL database connection string |
| `SUPABASE_KEY` | Supabase API security key for client access |
| `SUPABASE_URL` | Supabase project API routing URL |
| `TG_BOT_TOKEN` | Token validating Telegram Webhook access |
| `REGIME_VERSION` | Default configuration regime version (e.g. `W14`) |
