import { UAIMDocument, UAIMRiskCode } from '../../models/uaim/types.js';

const RULE_WEIGHTS: Record<string, number> = {
  SHARED_FUNDING_PARENT: 5,
  DEPLOYER_FUNDED_BUYERS: 5,
  KNOWN_BAD_ACTORS: 5,
  DEV_BAD_HISTORY: 4,
  DEV_DUMPED_EARLY: 4,
  SAME_BLOCK_CONCENTRATION: 3,
  UNIFORM_BUY_SIZES: 3,
  FRESH_WALLETS_RATIO: 2,
  CLUSTER_DOMINANCE: 5
};

const MAX_SCORE_POSSIBLE = 36;

export function scoreUaimDocument(uaim: UAIMDocument, risks: UAIMRiskCode[]): UAIMDocument {
  let scoreSum = 0;
  for (const risk of risks) {
    scoreSum += RULE_WEIGHTS[risk.code] || 0;
  }

  let riskScore = Math.round((scoreSum / MAX_SCORE_POSSIBLE) * 100);
  let verdict: 'CAP' | 'NO CAP' = 'NO CAP';
  let subclass: 'extraction' | 'organic' | 'coordinated' = 'organic';

  const parentShare = uaim.ownership.clusterAdjustedConcentration;
  const clusterDominance = uaim.ownership.clusterAdjustedConcentration;

  if (riskScore >= 60 || parentShare >= 0.60 || clusterDominance >= 0.70) {
    verdict = 'CAP';
    subclass = 'extraction';
    riskScore = Math.max(riskScore, 60);
  } else if (riskScore >= 30 || parentShare >= 0.20 || clusterDominance >= 0.30) {
    verdict = 'NO CAP';
    subclass = 'coordinated';
    riskScore = Math.max(riskScore, 30);
  } else {
    verdict = 'NO CAP';
    subclass = 'organic';
  }

  // Confidence = how certain we are in the verdict, NOT risk level.
  // 0 risks + organic = very confident it's safe (high confidence).
  // Many risks + CAP = very confident it's a threat (high confidence).
  // Low data quality (few trades, no funding) = low confidence.
  const tradeCount = uaim.ownership?.holderCount ?? 0;
  const hasFundingData = uaim.fundingGraph?.edges?.length > 0;
  const hasRiskData = risks.length > 0;
  const dataCompleteness = ((tradeCount > 10 ? 0.4 : tradeCount > 3 ? 0.2 : 0) + (hasFundingData ? 0.3 : 0) + (hasRiskData ? 0.3 : 0.15));
  const confidence = Math.round(Math.min(0.95, Math.max(0.35, dataCompleteness)) * 100) / 100;

  uaim.score = {
    value: riskScore,
    verdict,
    subclass,
    confidence,
    regimeVersion: 'W14',
    oneLineReason: risks[0] ? `Risk detected: ${risks[0].code}` : 'Funding and buyer patterns appear organic.'
  };
  uaim.risks = risks;

  return uaim;
}
