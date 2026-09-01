// src/nucleus/subsystems/guardian/guardianLifecycleController.ts

import {
  GuardianLifecycleRuntime,
  GuardianLifecycleContext,
  GuardianLifecycleResult,
} from "./guardianLifecycleRuntime";

export class GuardianLifecycleController {
  constructor(private organizationId: string) {}

  async run(context: GuardianLifecycleContext): Promise<GuardianLifecycleResult> {
    const runtime = new GuardianLifecycleRuntime(this.organizationId);
    return runtime.run(context);
  }

  async health() {
    const runtime = new GuardianLifecycleRuntime(this.organizationId);
    return runtime.health();
  }
}
