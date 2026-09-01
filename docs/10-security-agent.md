# Security Agent Specification

The **Security Agent** ensures the safety of backend systems, handles API rate-limiting rules, manages configuration security, and enforces payment gating constraints.

## Role Responsibilities
1. **Wallet Verification & Gating**: Validates user access based on connected wallet assets (checks if wallet holds >= 66,666 $NOCAP or has paid 0.05 SOL via blockhash-proxied transaction checks).
2. **Scoring Confidentiality**: Prevents leakages of exact thresholds or rule weights to public documentation.
3. **Endpoint Rate Limiting**: Establishes protection parameters against DDoS and automated wallet scanning loops.

## Secrets & Environmental Values
The following parameters must be loaded securely and never hardcoded or pushed to repository logs:
* `HELIUS_API_KEY`: Connection token to access Solana Helius RPC/data feeds.
* `DATABASE_URL`: Connection string containing Postgres credentials.
* `SUPABASE_KEY` & `SUPABASE_URL`: Keys to access the Supabase DB client interface.
* `TG_BOT_TOKEN`: Token key validating Telegram Bot Webhook signatures.

## Wallet Gating Rules
* **Free Scan Threshold**: A wallet is allowed exactly 3 free trial scans.
* **$NOCAP Holding Gating**: Bypasses the 3 scans limit if the connected wallet has a balance of at least **66,666 $NOCAP** tokens.
* **Solana Payment Gating**: Enforces a 0.05 SOL payment scan fee using Phantom. Triggers a transaction verification signature check on Solana RPC using a blockhash proxy verification.
