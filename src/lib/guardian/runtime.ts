// src/lib/guardian/runtime.ts
// extend runtime state with lifecycle

export type GuardianRuntimeState = {
  loading: boolean;
  error: string | null;
  risk: GuardianRiskModel | null;
  rules: GuardianRuleEngineModel | null;
  scoring: GuardianScoringModel | null;
  killSwitch: GuardianKillSwitchModel | null;
  repair: GuardianRepairModel | null;
  lifecycle: GuardianLifecycleModel | null;
  health: { status: string; timestamp: string | null };
  rulesHealth: { status: string; timestamp: string | null };
  scoringHealth: { status: string; timestamp: string | null };
  killSwitchHealth: { status: string; timestamp: string | null };
  repairHealth: { status: string; timestamp: string | null };
  lifecycleHealth: { status: string; timestamp: string | null };
};

// inside evaluateClaim, after repair:

const lifecycleResponse = await runGuardianLifecycle({
  claimId,
  organizationId: this.organizationId,
  claimPayload: payload,
});

const lifecycleModel = buildGuardianLifecycleModel(lifecycleResponse);

const [
  health,
  rulesHealth,
  scoringHealth,
  killSwitchHealth,
  repairHealth,
  lifecycleHealth,
] = await Promise.all([
  this.checkHealth(),
  this.checkRulesHealth(),
  this.checkScoringHealth(),
  this.checkKillSwitchHealth(),
  this.checkRepairHealth(),
  this.checkLifecycleHealth(),
]);

return {
  ...baseState,
  loading: false,
  risk: riskModel,
  rules: rulesModel,
  scoring: scoringModel,
  killSwitch: killSwitchModel,
  repair: repairModel,
  lifecycle: lifecycleModel,
  health,
  rulesHealth,
  scoringHealth,
  killSwitchHealth,
  repairHealth,
  lifecycleHealth,
};

// add lifecycle health method

async checkLifecycleHealth() {
  try {
    const health = await getGuardianLifecycleHealth(this.organizationId);
    return { status: health.status, timestamp: health.timestamp };
  } catch {
    return { status: "unknown", timestamp: null };
  }
}
