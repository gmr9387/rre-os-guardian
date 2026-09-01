// src/nucleus/subsystems/guardian/guardianLifecycleRouter.ts

import { Router } from "express";
import { GuardianLifecycleController } from "./guardianLifecycleController";

export function guardianLifecycleRouter() {
  const router = Router();

  router.post("/claim/lifecycle/run", async (req, res) => {
    const organizationId = req.headers["x-org-id"] as string;
    const controller = new GuardianLifecycleController(organizationId);

    const context = {
      claimId: req.body.claimId,
      organizationId,
      claimPayload: req.body.claimPayload || {},
    };

    const result = await controller.run(context);
    res.json(result);
  });

  router.get("/claim/lifecycle/health", async (req, res) => {
    const organizationId = req.headers["x-org-id"] as string;
    const controller = new GuardianLifecycleController(organizationId);
    const result = await controller.health();
    res.json(result);
  });

  return router;
}
