// src/nucleus/subsystems/guardian/guardianKillSwitchRuntime.ts

import { NucleusTelemetryAdapter } from "../../nucleusTracing";

export type GuardianKillSwitchContext = {
  claimId: string;
  organizationId: string;
  riskTier: "low" | "medium" | "high" | "critical";
  flags: string[];
};

export type GuardianKillSwitchDecision =
  | "ALLOW"
  | "ADVISORY"
  | "SOFT_STOP"
  | "HARD_STOP";

export type GuardianKillSwitchResult = {
  claimId: string;
  organizationId: string;
  decision: GuardianKillSwitchDecision;
  reason: string;
  flags: string[];
  timestamp: string;
};

export class GuardianKillSwitchRuntime {
  private telemetry: NucleusTelemetryAdapter;

  constructor(private organizationId: string) {
    this.telemetry = new NucleusTelemetryAdapter(
      organizationId,
      "guardian-kill-switch"
    );
  }

  async run(context: GuardianKillSwitchContext): Promise<GuardianKillSwitchResult> {
    const span = this.telemetry.startSpan("guardian:kill-switch");

    try {
      let decision: GuardianKillSwitchDecision;
      let reason: string;

      switch (context.riskTier) {
        case "critical":
          decision = "HARD_STOP";
          reason = "Critical risk tier — claim blocked.";
          break;
        case "high":
          decision = "SOFT_STOP";
          reason = "High risk tier — claim paused for review.";
          break;
        case "medium":
          decision = "ADVISORY";
          reason = "Medium risk tier — advisory warning.";
          break;
        default:
          decision = "ALLOW";
          reason = "Low risk tier — claim allowed.";
      }

      const result: GuardianKillSwitchResult = {
        claimId: context.claimId,
        organizationId: context.organizationId,
        decision,
        reason,
        flags: context.flags,
        timestamp: new Date().toISOString(),
      };

      await this.telemetry.info("Kill-switch decision generated", result);
      return result;
    } catch (err) {
      await this.telemetry.error("Kill-switch failed", { error: err });
      throw err;
    } finally {
      this.telemetry.endSpan(span.spanId);
    }
  }

  async health() {
    return {
      status: "healthy",
      runtime: "guardian-kill-switch",
      timestamp: new Date().toISOString(),
    };
  }
}
