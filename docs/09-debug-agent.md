# Debug Agent Specification

The **Debug Agent** provides tools and logging standards to monitor pipeline performance, trace errors, and measure RPC costs.

## Role Responsibilities
1. **RPC Usage Tracking**: Implements request tracking to log the count and type of blockchain RPC methods (EVM and Solana) called per scan.
2. **Network/DNS Troubleshooting**: Configures dns resolution order defaults to prevent ESM hoisting race conditions and bypass connection limitations on hosting platforms (e.g. Railway IPv6 lookup issues).
3. **Database Diagnostics**: Provides utility scripts to test connection states and verify table migrations.

## Diagnostic Scripts
* **check-db**: A package utility to test client connectivity and check tables status.
```bash
pnpm --filter @nocap/db run check-db
```

## Network Debugging Workarounds
* Custom DNS overrides are configured directly in client modules to force IPv4 priority (`dns.setDefaultResultOrder('ipv4first')`) ensuring stable connection to RPC endpoints and database servers.
