# QA Agent Specification

The **QA Agent** validates system calculations, sets up test harnesses for rulesets, and manages regression verification suites.

## Role Responsibilities
1. **Automated Unit Testing**: Develops test suites targeting parsed logs and individual feature scorers in `packages/core/src/test` (including milestone unit tests).
2. **Holdout Dataset Calibration**: Measures scorer performance against static transaction sets before deploying new config regimes.
3. **Endpoint Validation**: Runs automated tests verifying that Next.js SSE chunk headers and response parameters match target specifications.

## Holdout Performance Goals
> [!IMPORTANT]
> The ruleset validation engine must achieve a minimum accuracy threshold before live deployment:
> * **CAP Class Precision**: Must exceed **90%** on the validation holdout dataset.
> * If the precision falls below this threshold, calibration coefficients must be revised in shadow mode.

## Testing Setup
```bash
# Executing Core Engine Rule Tests (including milestone tests)
pnpm --filter @nocap/core run test
```
