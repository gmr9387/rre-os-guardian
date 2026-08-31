// src/lib/guardian/runtime.ts

import {
  runGuardianRisk,
  getGuardianHealth,
  GuardianRiskRequest,
} from "../../integrations/guardian/api";
import {
  buildGuardianRiskModel,
  GuardianRiskModel,
  mapRiskTier,
} from "./models";

export type GuardianRuntimeState = {
  loading: boolean;
  error: string | null;
  risk: GuardianRiskModel | null;
  health: {
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
      health: { status: "unknown", timestamp: null },
    };

    try {
      const request: GuardianRiskRequest = {
        claimId,
        organizationId: this.organizationId,
        payload,
      };

      const response = await runGuardianRisk(request);

      const riskTier =
        response.riskTier || mapRiskTier(response.riskScore ?? 0);

      const riskModel = buildGuardianRiskModel({
        claimId: response.claimId,
        riskScore: response.riskScore,
        riskTier,
        flags: response.flags || [],
        details: response.details,
      });

      return {
        ...baseState,
        loading: false,
        risk: riskModel,
      };
    } catch (err: any) {
      return {
        ...baseState,
        loading: false,
        error: err?.message || "Guardian evaluation failed",
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
}
