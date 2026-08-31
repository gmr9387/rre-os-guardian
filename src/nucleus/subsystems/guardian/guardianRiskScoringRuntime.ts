// src/nucleus/subsystems/guardian/guardianRiskScoringRuntime.ts

import { NucleusTelemetryAdapter } from "../../nucleusTracing";

export type GuardianScoringContext = {
  claimId: string;
  organizationId: string;
  flags: string[];
  baseScore?: number;
};

export type GuardianScoringResult = {
  claimId: string;
  organizationId: string;
  riskScore: number;
  riskTier: "low" | "medium" | "high" | "critical";
  weightedFlags: Record<string, number>;
};

export class GuardianRiskScoringRuntime {
  private telemetry: NucleusTelemetryAdapter;

  constructor(private organizationId: string) {
    this.telemetry = new NucleusTelemetryAdapter(
      organizationId,
      "guardian-risk-scoring"
    );
  }

  async run(context: GuardianScoringContext): Promise<GuardianScoringResult> {
    const span = this.telemetry.startSpan("guardian:scoring");

    try {
      const weights: Record<string, number> = {
        high_cost_claim: 0.4,
        missing_diagnosis_codes: 0.3,
        duplicate_claim_suspected: 0.5,
      };

      const weightedFlags: Record<string, number> = {};
      let score = context.baseScore ?? 0.1;

      for (const flag of context.flags) {
        const w = weights[flag] ?? 0.2;
        weightedFlags[flag] = w;
        score += w;
      }

      if (score > 1) score = 1;

      const tier =
        score < 0.2
          ? "low"
          : score < 0.5
          ? "medium"
          : score < 0.8
          ? "high"
          : "critical";

      const result: GuardianScoringResult = {
        claimId: context.claimId,
        organizationId: context.organizationId,
        riskScore: score,
        riskTier: tier,
        weightedFlags,
      };

      await this.telemetry.info("Guardian scoring completed", result);
      return result;
    } catch (err) {
      await this.telemetry.error("Guardian scoring failed", { error: err });
      throw err;
    } finally {
      this.telemetry.endSpan(span.spanId);
    }
  }

  async health() {
    return {
      status: "healthy",
      runtime: "guardian-risk-scoring",
      timestamp: new Date().toISOString(),
    };
  }
}
