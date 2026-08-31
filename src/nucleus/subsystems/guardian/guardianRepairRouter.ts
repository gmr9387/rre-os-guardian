// src/nucleus/subsystems/guardian/guardianRepairRouter.ts

import { Router } from "express";
import { GuardianRepairController } from "./guardianRepairController";

export function guardianRepairRouter() {
  const router = Router();

  router.post("/risk/repair/run", async (req, res) => {
    const organizationId = req.headers["x-org-id"] as string;
    const controller = new GuardianRepairController(organizationId);

    const context = {
      claimId: req.body.claimId,
      organizationId,
      claimPayload: req.body.claimPayload || {},
      riskTier: req.body.riskTier,
      flags: req.body.flags || [],
    };

    const result = await controller.repair(context);
    res.json(result);
  });

  router.get("/risk/repair/health", async (req, res) => {
    const organizationId = req.headers["x-org-id"] as string;
    const controller = new GuardianRepairController(organizationId);
    const result = await controller.health();
    res.json(result);
  });

  return router;
}
