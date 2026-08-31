// src/nucleus/subsystems/guardian/guardianRuleEngineRuntime.ts

import { NucleusTelemetryAdapter } from "../../nucleusTracing";

export type GuardianRuleContext = {
  claimId: string;
  organizationId: string;
  payload: Record<string, any>;
};

export type GuardianRuleResult = {
  claimId: string;
  organizationId: string;
  rulesEvaluated: number;
  passed: string[];
  failed: string[];
  flags: string[];
  riskScore: number;
  riskTier: "low" | "medium" | "high" | "critical";
  details?: Record<string, any>;
};

export class GuardianRuleEngineRuntime {
  private telemetry: NucleusTelemetryAdapter;

  constructor(private organizationId: string) {
    this.telemetry = new NucleusTelemetryAdapter(
      organizationId,
      "guardian-rule-engine"
    );
  }

  async run(context: GuardianRuleContext): Promise<GuardianRuleResult> {
    const span = this.telemetry.startSpan("guardian:rules");

    try {
      const rules: Array<(ctx: GuardianRuleContext) => string | null> = [
        this.highCostRule,
        this.missingDiagnosisRule,
        this.duplicateClaimRule,
      ];

      const passed: string[] = [];
      const failed: string[] = [];
      const flags: string[] = [];

      for (const rule of rules) {
        const code = rule(context);
        if (code) {
          failed.push(code);
          flags.push(code);
        } else {
          passed.push(rule.name || "unknown_rule");
        }
      }

      const riskScore = this.computeRiskScore(flags);
      const riskTier = this.mapRiskTier(riskScore);

      const result: GuardianRuleResult = {
        claimId: context.claimId,
        organizationId: context.organizationId,
        rulesEvaluated: rules.length,
        passed,
        failed,
        flags,
        riskScore,
        riskTier,
        details: {
          payloadSnapshot: context.payload,
        },
      };

      await this.telemetry.info("Guardian rules evaluated", result);
      return result;
    } catch (err) {
      await this.telemetry.error("Guardian rule engine failed", { error: err });
      throw err;
    } finally {
      this.telemetry.endSpan(span.spanId);
    }
  }

  async health() {
    return {
      status: "healthy",
      runtime: "guardian-rule-engine",
      timestamp: new Date().toISOString(),
    };
  }

  private highCostRule(ctx: GuardianRuleContext): string | null {
    const amount = ctx.payload?.allowedAmount ?? ctx.payload?.billedAmount ?? 0;
    if (amount > 50000) {
      return "high_cost_claim";
    }
    return null;
  }

  private missingDiagnosisRule(ctx: GuardianRuleContext): string | null {
    const diagnosis = ctx.payload?.diagnosisCodes ?? [];
    if (!diagnosis || diagnosis.length === 0) {
      return "missing_diagnosis_codes";
    }
    return null;
  }

  private duplicateClaimRule(ctx: GuardianRuleContext): string | null {
    const externalId = ctx.payload?.externalClaimId;
    if (externalId && String(externalId).startsWith("DUP-")) {
      return "duplicate_claim_suspected";
    }
    return null;
  }

  private computeRiskScore(flags: string[]): number {
    if (flags.length === 0) return 0.1;
    if (flags.length === 1) return 0.4;
    if (flags.length === 2) return 0.7;
    return 0.9;
  }

  private mapRiskTier(score: number): "low" | "medium" | "high" | "critical" {
    if (score < 0.2) return "low";
    if (score < 0.5) return "medium";
    if (score < 0.8) return "high";
    return "critical";
  }
}
