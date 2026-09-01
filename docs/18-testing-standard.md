# Testing Standards

This document establishes the testing standards to ensure the accuracy of rule evaluations and the reliability of scan workflows.

## 1. Core Engine Unit Testing
* Target: Features calculation logic and milestone integration tests in `packages/core`.
* Rules calculation logic must be tested against **static mock fixtures** (pre-saved JSON logs of real Pump.fun launches or EVM logs).
* Avoid triggering live RPC connections inside test scripts. Mock connections to return predictable outputs for target addresses.

## 2. Testing Execution
Tests are run using mocha / vitest against packages:
```bash
# Execute core packages tests
pnpm --filter @nocap/core run test
```

## 3. Coverage Targets
* **Engine calculations (`packages/core/src/engine`)**: Minimum test coverage of **95%**.
* **Next.js Web / API Handlers (`apps/web`)**: Minimum test coverage of **80%**.
