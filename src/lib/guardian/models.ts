// src/lib/guardian/models.ts

export type RiskTier = "low" | "medium" | "high" | "critical";

export type GuardianFlag = {
  code: string;
  label: string;
  severity: RiskTier;
};

export type GuardianRiskModel = {
  claimId: string;
  riskScore: number;
  riskTier: RiskTier;
  flags: GuardianFlag[];
  details?: Record<string, any>;
};

export type GuardianRuleEngineModel = {
  claimId: string;
  organizationId: string;
  rulesEvaluated: number;
  passed: string[];
  failed: string[];
  flags: GuardianFlag[];
  riskScore: number;
  riskTier: RiskTier;
  details?: Record<string, any>;
};

export function mapRiskTier(score: number): RiskTier {
  if (score < 0.2) return "low";
  if (score < 0.5) return "medium";
  if (score < 0.8) return "high";
  return "critical";
}

export function normalizeFlags(rawFlags: string[]): GuardianFlag[] {
  return rawFlags.map((code) => ({
    code,
    label: code.replace(/_/g, " ").toUpperCase(),
    severity: "medium",
  }));
}

export function buildGuardianRiskModel(input: {
  claimId: string;
  riskScore: number;
  riskTier: RiskTier;
  flags: string[];
  details?: Record<string, any>;
}): GuardianRiskModel {
  return {
    claimId: input.claimId,
    riskScore: input.riskScore,
    riskTier: input.riskTier,
    flags: normalizeFlags(input.flags),
    details: input.details,
  };
}

export function buildGuardianRuleEngineModel(input: {
  claimId: string;
  organizationId: string;
  rulesEvaluated: number;
  passed: string[];
  failed: string[];
  flags: string[];
  riskScore: number;
  riskTier: RiskTier;
  details?: Record<string, any>;
}): GuardianRuleEngineModel {
  return {
    claimId: input.claimId,
    organizationId: input.organizationId,
    rulesEvaluated: input.rulesEvaluated,
    passed: input.passed,
    failed: input.failed,
    flags: normalizeFlags(input.flags),
    riskScore: input.riskScore,
    riskTier: input.riskTier,
    details: input.details,
  };
}
