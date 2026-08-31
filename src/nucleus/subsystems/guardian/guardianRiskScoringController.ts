// src/nucleus/subsystems/guardian/guardianRiskScoringController.ts

import {
  GuardianRiskScoringRuntime,
  GuardianScoringContext,
  GuardianScoringResult,
} from "./guardianRiskScoringRuntime";

export class GuardianRiskScoringController {
  constructor(private organizationId: string) {}

  async score(context: GuardianScoringContext): Promise<GuardianScoringResult> {
    const runtime = new GuardianRiskScoringRuntime(this.organizationId);
    return runtime.run(context);
  }

  async health() {
    const runtime = new GuardianRiskScoringRuntime(this.organizationId);
    return runtime.health();
  }
}
