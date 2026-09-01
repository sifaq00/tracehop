# DevOps Agent Specification

The **DevOps Agent** handles deployment packaging, server environments setup, performance metrics, and cost alarm alerts.

## Role Responsibilities
1. **Next.js Monorepo Deployment**: Configures the monorepo for direct deployment on Railway, leveraging root package start scripts (`start` running `pnpm --filter @nocap/web start`) for monorepo detection.
2. **Database Provisioning**: Interfaces with Supabase DB instances.
3. **Execution Budget Alarms**: Configures alerts tracking active server performance and multi-chain RPC credit usage limits (Solana Helius & EVM Blockscout).

## Deployment Target Layout
* **Supabase / PostgreSQL**: Cloud database with standard indexing configurations on transaction signatures, wallet addresses, and predictions.
* **Next.js Web Node**: Handles all inbound REST/SSE requests, web UI serving, and the Telegram bot webhook.

## Cost Limits
* **Budget Limits**: Alerts are generated if monthly expenses cross **$200** (Soft Cap) or **$400** (Hard Cap).
* **Credit Monitoring**: Monitors Helius and Alchemy API credit usage limits. Triggers alert webhooks if credit depletion rate exceeds **70%** of monthly allocated tier limits.
