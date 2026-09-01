// src/lib/guardian/runtime.ts

import {
  runGuardianRisk,
  runGuardianRules,
  runGuardianScoring,
  runGuardianKillSwitch,
  runGuardianRepair,
  getGuardianHealth,
  getGuardianRulesHealth,
  getGuardianScoringHealth,
  getGuardianKillSwitchHealth,
  getGuardianRepairHealth,
  GuardianRiskRequest,
} from "../../integrations/guardian/api";

import {
  buildGuardianRiskModel,
  buildGuardianRuleEngineModel,
  buildGuardianScoringModel,
  buildGuardianKillSwitchModel,
  buildGuardianRepairModel,
  GuardianRiskModel,
  GuardianRuleEngineModel,
  GuardianScoringModel,
  GuardianKillSwitchModel,
  GuardianRepairModel,
  mapRiskTier,
} from "./models";

export type GuardianRuntimeState = {
  loading: boolean;
  error: string | null;
  risk: GuardianRiskModel | null;
  rules: GuardianRuleEngineModel | null;
  scoring: GuardianScoringModel | null;
  killSwitch: GuardianKillSwitchModel | null;
  repair: GuardianRepairModel | null;
  health: { status: string; timestamp: string | null };
  rulesHealth: { status: string; timestamp: string | null };
  scoringHealth: { status: string; timestamp: string | null };
  killSwitchHealth: { status: string; timestamp: string | null };
  repairHealth: { status: string; timestamp: string | null };
};

export class GuardianRuntime {
  private organizationId: string;

  constructor(organizationId: string) {
    this.organizationId = organizationId;
  }

  async evaluateClaim(
    claimId: string,
    payload: Record<string, any>
  ): Promise<GuardianRuntimeState> {
    const baseState: GuardianRuntimeState = {
      loading: true,
      error: null,
      risk: null,
      rules: null,
      scoring: null,
      killSwitch: null,
      repair: null,
      health: { status: "unknown", timestamp: null },
      rulesHealth: { status: "unknown", timestamp: null },
      scoringHealth: { status: "unknown", timestamp: null },
      killSwitchHealth: { status: "unknown", timestamp: null },
      repairHealth: { status: "unknown", timestamp: null },
    };

    try {
      const request: GuardianRiskRequest = {
        claimId,
        organizationId: this.organizationId,
        payload,
      };

      const [riskResponse, rulesResponse] = await Promise.all([
        runGuardianRisk(request),
        runGuardianRules(request),
      ]);

      const riskTier =
        riskResponse.riskTier || mapRiskTier(riskResponse.riskScore ?? 0);

      const riskModel = buildGuardianRiskModel({
        claimId: riskResponse.claimId,
        riskScore: riskResponse.riskScore,
        riskTier,
        flags: riskResponse.flags || [],
        details: riskResponse.details,
      });

      const rulesModel = buildGuardianRuleEngineModel({
        claimId: rulesResponse.claimId,
        organizationId: rulesResponse.organizationId,
        rulesEvaluated: rulesResponse.rulesEvaluated,
        passed: rulesResponse.passed || [],
        failed: rulesResponse.failed || [],
        flags: rulesResponse.flags || [],
        riskScore: rulesResponse.riskScore,
        riskTier: rulesResponse.riskTier,
        details: rulesResponse.details,
      });

      const scoringResponse = await runGuardianScoring({
        claimId,
        organizationId: this.organizationId,
        flags: rulesResponse.flags,
        baseScore: riskResponse.riskScore,
      });

      const scoringModel = buildGuardianScoringModel(scoringResponse);

      const killSwitchResponse = await runGuardianKillSwitch({
        claimId,
        organizationId: this.organizationId,
        riskTier: scoringResponse.riskTier,
        flags: rulesResponse.flags,
      });

      const killSwitchModel = buildGuardianKillSwitchModel(killSwitchResponse);

      const repairResponse = await runGuardianRepair({
        claimId,
        organizationId: this.organizationId,
        riskTier: scoringResponse.riskTier,
        flags: rulesResponse.flags,
        claimPayload: payload,
      });

      const repairModel = buildGuardianRepairModel(repairResponse);

      const [
        health,
        rulesHealth,
        scoringHealth,
        killSwitchHealth,
        repairHealth,
      ] = await Promise.all([
        this.checkHealth(),
        this.checkRulesHealth(),
        this.checkScoringHealth(),
        this.checkKillSwitchHealth(),
        this.checkRepairHealth(),
      ]);

      return {
        ...baseState,
        loading: false,
        risk: riskModel,
        rules: rulesModel,
        scoring: scoringModel,
        killSwitch: killSwitchModel,
        repair: repairModel,
        health,
        rulesHealth,
        scoringHealth,
        killSwitchHealth,
        repairHealth,
      };
    } catch (err: any) {
      const [
        health,
        rulesHealth,
        scoringHealth,
        killSwitchHealth,
        repairHealth,
      ] = await Promise.all([
        this.checkHealth(),
        this.checkRulesHealth(),
        this.checkScoringHealth(),
        this.checkKillSwitchHealth(),
        this.checkRepairHealth(),
      ]);

      return {
        ...baseState,
        loading: false,
        error: err?.message || "Guardian evaluation failed",
        health,
        rulesHealth,
        scoringHealth,
        killSwitchHealth,
        repairHealth,
      };
    }
  }

  async checkHealth() {
    try {
      const health = await getGuardianHealth(this.organizationId);
      return { status: health.status, timestamp: health.timestamp };
    } catch {
      return { status: "unknown", timestamp: null };
    }
  }

  async checkRulesHealth() {
    try {
      const health = await getGuardianRulesHealth(this.organizationId);
      return { status: health.status, timestamp: health.timestamp };
    } catch {
      return { status: "unknown", timestamp: null };
    }
  }

  async checkScoringHealth() {
    try {
      const health = await getGuardianScoringHealth(this.organizationId);
      return { status: health.status, timestamp: health.timestamp };
    } catch {
      return { status: "unknown", timestamp: null };
    }
  }

  async checkKillSwitchHealth() {
    try {
      const health = await getGuardianKillSwitchHealth(this.organizationId);
      return { status: health.status, timestamp: health.timestamp };
    } catch {
      return { status: "unknown", timestamp: null };
    }
  }

  async checkRepairHealth() {
    try {
      const health = await getGuardianRepairHealth(this.organizationId);
      return { status: health.status, timestamp: health.timestamp };
    } catch {
      return { status: "unknown", timestamp: null };
    }
  }
}
