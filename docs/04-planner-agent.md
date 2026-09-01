# Planner Agent Specification

The **Planner Agent** manages the dynamic JSON rules engine, rule severity weights, scoring calibrators, and verdict risk formulas.

## Role Responsibilities
1. **Dynamic JSON Rules Engine**: Parses and evaluates rules stored in the `risk_rules` database table.
2. **1-5 Star Weights System**: Assigns severity weights (1 to 5 stars) to rules.
3. **Verdict Calibration**: Computes the final risk percentage (0% to 100%) and maps it to `extraction` (CAP) or `organic` (NO CAP) verdicts.

## Scoring Model & Calibration
The scorer evaluates active rules. Each triggered rule adds a weighted score based on its severity level:
* **Low / 1-2 Stars**: Minimal risk indicators (e.g. minor cluster overlaps).
* **Medium / 3 Stars**: Moderate risk indicators (e.g. fresh wallet dominance).
* **High / 4-5 Stars**: Critical risk indicators (e.g. high shared parent funding share, known bad overlap, deployer funding, stock token impersonation).

A high shared parent funding share triggers an automatic **CAP** verdict directly.

### Verdict Output Schema
```typescript
interface ScorerVerdict {
  verdict: 'CAP' | 'NO CAP';
  subclass: 'extraction' | 'organic' | 'coordinated';
  confidence: number; // Risk percentage score from 0 to 1
  reasons: Array<{
    code: string;
    text: string;
    severity: 'low' | 'medium' | 'high';
  }>;
}
```

For **NO CAP** (safe/organic) verdicts, the confidence score represents the organic trust percentage.
If coordinated buying is detected without hostile extraction, the subclass is marked as `coordinated` and is assigned a yellow UI warning state instead of the default green organic style.
