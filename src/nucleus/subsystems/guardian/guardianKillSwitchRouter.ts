// src/nucleus/subsystems/guardian/guardianKillSwitchRouter.ts

import { Router } from "express";
import { GuardianKillSwitchController } from "./guardianKillSwitchController";

export function guardianKillSwitchRouter() {
  const router = Router();

  router.post("/risk/kill-switch/run", async (req, res) => {
    const organizationId = req.headers["x-org-id"] as string;
    const controller = new GuardianKillSwitchController(organizationId);

    const context = {
      claimId: req.body.claimId,
      organizationId,
      riskTier: req.body.riskTier,
      flags: req.body.flags || [],
    };

    const result = await controller.decide(context);
    res.json(result);
  });

  router.get("/risk/kill-switch/health", async (req, res) => {
    const organizationId = req.headers["x-org-id"] as string;
    const controller = new GuardianKillSwitchController(organizationId);
    const result = await controller.health();
    res.json(result);
  });

  return router;
}
