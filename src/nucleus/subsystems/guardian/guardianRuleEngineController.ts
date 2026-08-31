// src/nucleus/subsystems/guardian/guardianRuleEngineController.ts

import {
  GuardianRuleEngineRuntime,
  GuardianRuleContext,
  GuardianRuleResult,
} from "./guardianRuleEngineRuntime";

export class GuardianRuleEngineController {
  constructor(private organizationId: string) {}

  async evaluate(context: GuardianRuleContext): Promise<GuardianRuleResult> {
    const runtime = new GuardianRuleEngineRuntime(this.organizationId);
    return runtime.run(context);
  }

  async health() {
    const runtime = new GuardianRuleEngineRuntime(this.organizationId);
    return runtime.health();
  }
}
