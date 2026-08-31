// src/nucleus/subsystems/guardian/guardianRepairController.ts

import {
  GuardianRepairRuntime,
  GuardianRepairContext,
  GuardianRepairResult,
} from "./guardianRepairRuntime";

export class GuardianRepairController {
  constructor(private organizationId: string) {}

  async repair(context: GuardianRepairContext): Promise<GuardianRepairResult> {
    const runtime = new GuardianRepairRuntime(this.organizationId);
    return runtime.run(context);
  }

  async health() {
    const runtime = new GuardianRepairRuntime(this.organizationId);
    return runtime.health();
  }
}
