// src/nucleus/subsystems/guardian/guardianKillSwitchController.ts

import {
  GuardianKillSwitchRuntime,
  GuardianKillSwitchContext,
  GuardianKillSwitchResult,
} from "./guardianKillSwitchRuntime";

export class GuardianKillSwitchController {
  constructor(private organizationId: string) {}

  async decide(context: GuardianKillSwitchContext): Promise<GuardianKillSwitchResult> {
    const runtime = new GuardianKillSwitchRuntime(this.organizationId);
    return runtime.run(context);
  }

  async health() {
    const runtime = new GuardianKillSwitchRuntime(this.organizationId);
    return runtime.health();
  }
}
