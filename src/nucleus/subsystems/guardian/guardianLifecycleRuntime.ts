// src/nucleus/subsystems/guardian/guardianLifecycleRuntime.ts

import { NucleusTelemetryAdapter } from "../../nucleusTracing";
import { GuardianRepairRuntime } from "./guardianRepairRuntime";
import { GuardianKillSwitchRuntime } from "./guardianKillSwitchRuntime";

export type GuardianLifecycleState =
  | "INGESTED"
  | "EVALUATED"
  | "REPAIRED"
  | "ENFORCED"
  | "FINALIZED"
  | "REOPENED";

export type GuardianLifecycleContext = {
  claimId: string;
  organizationId: string;
  claimPayload: Record<string, any>;
};

export type GuardianLifecycleEvent = {
  from: GuardianLifecycleState;
  to: GuardianLifecycleState;
  timestamp: string;
  reason: string;
};

export type GuardianUnifiedClaim = {
  originalClaimPayload: Record<string, any>;
  repairedClaimPayload: Record<string, any> | null;
  lifecycleState: GuardianLifecycleState;
  lifecycleEvents: GuardianLifecycleEvent[];
};

export type GuardianLifecycleResult = {
  claimId: string;
  organizationId: string;
  unifiedClaim: GuardianUnifiedClaim;
};

export class GuardianLifecycleRuntime {
  private telemetry: NucleusTelemetryAdapter;

  constructor(private organizationId: string) {
    this.telemetry = new NucleusTelemetryAdapter(
      organizationId,
      "guardian-lifecycle"
    );
  }

  async run(context: GuardianLifecycleContext): Promise<GuardianLifecycleResult> {
    const span = this.telemetry.startSpan("guardian:lifecycle");

    try {
      const events: GuardianLifecycleEvent[] = [];
      const now = () => new Date().toISOString();

      let state: GuardianLifecycleState = "INGESTED";
      events.push({
        from: "INGESTED",
        to: "EVALUATED",
        timestamp: now(),
        reason: "Claim ingested and evaluated by Guardian engines.",
      });
      state = "EVALUATED";

      const repairRuntime = new GuardianRepairRuntime(this.organizationId);
      const repairResult = await repairRuntime.run({
        claimId: context.claimId,
        organizationId: context.organizationId,
        claimPayload: context.claimPayload,
        riskTier: "medium",
        flags: [],
      });

      events.push({
        from: "EVALUATED",
        to: "REPAIRED",
        timestamp: now(),
        reason: "Claim repaired by Guardian repair engine.",
      });
      state = "REPAIRED";

      const killSwitchRuntime = new GuardianKillSwitchRuntime(
        this.organizationId
      );
      const killResult = await killSwitchRuntime.run({
        claimId: context.claimId,
        organizationId: context.organizationId,
        riskTier: "medium",
        flags: [],
      });

      events.push({
        from: "REPAIRED",
        to: "ENFORCED",
        timestamp: now(),
        reason: `Kill-switch decision applied: ${killResult.decision}.`,
      });
      state = "ENFORCED";

      events.push({
        from: "ENFORCED",
        to: "FINALIZED",
        timestamp: now(),
        reason: "Claim lifecycle finalized.",
      });
      state = "FINALIZED";

      const unifiedClaim: GuardianUnifiedClaim = {
        originalClaimPayload: context.claimPayload,
        repairedClaimPayload: repairResult.repairedClaimPayload,
        lifecycleState: state,
        lifecycleEvents: events,
      };

      const result: GuardianLifecycleResult = {
        claimId: context.claimId,
        organizationId: context.organizationId,
        unifiedClaim,
      };

      await this.telemetry.info("Guardian lifecycle completed", result);
      return result;
    } catch (err) {
      await this.telemetry.error("Guardian lifecycle failed", { error: err });
      throw err;
    } finally {
      this.telemetry.endSpan(span.spanId);
    }
  }

  async health() {
    return {
      status: "healthy",
      runtime: "guardian-lifecycle",
      timestamp: new Date().toISOString(),
    };
  }
}
