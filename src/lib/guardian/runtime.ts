// src/lib/guardian/runtime.ts

import {
  runGuardianRisk,
  runGuardianRules,
  getGuardianHealth,
  getGuardianRulesHealth,
  GuardianRiskRequest,
} from "../../integrations/guardian/api";
import {
  buildGuardianRiskModel,
  buildGuardianRuleEngineModel,
  GuardianRiskModel,
  GuardianRuleEngineModel,
  mapRiskTier,
} from "./models";

export type GuardianRuntimeState = {
  loading: boolean;
  error: string | null;
  risk: GuardianRiskModel | null;
  rules: GuardianRuleEngineModel | null;
  health: {
    status: "healthy" | "degraded" | "down" | "unknown";
    timestamp: string | null;
  };
  rulesHealth: {
    status: "healthy" | "degraded" | "down" | "unknown";
    timestamp: string | null;
  };
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
      health: { status: "unknown", timestamp: null },
      rulesHealth: { status: "unknown", timestamp: null },
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

      const [health, rulesHealth] = await Promise.all([
        this.checkHealth(),
        this.checkRulesHealth(),
      ]);

      return {
        ...baseState,
        loading: false,
        risk: riskModel,
        rules: rulesModel,
        health,
        rulesHealth,
      };
    } catch (err: any) {
      const [health, rulesHealth] = await Promise.all([
        this.checkHealth(),
        this.checkRulesHealth(),
      ]);

      return {
        ...baseState,
        loading: false,
        error: err?.message || "Guardian evaluation failed",
        health,
        rulesHealth,
      };
    }
  }

  async checkHealth(): Promise<GuardianRuntimeState["health"]> {
    try {
      const health = await getGuardianHealth(this.organizationId);
      return {
        status: health.status,
        timestamp: health.timestamp,
      };
    } catch {
      return {
        status: "unknown",
        timestamp: null,
      };
    }
  }

  async checkRulesHealth(): Promise<GuardianRuntimeState["rulesHealth"]> {
    try {
      const health = await getGuardianRulesHealth(this.organizationId);
      return {
        status: health.status,
        timestamp: health.timestamp,
      };
    } catch {
      return {
        status: "unknown",
        timestamp: null,
      };
    }
  }
}
