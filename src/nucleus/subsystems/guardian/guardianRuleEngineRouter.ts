// src/nucleus/subsystems/guardian/guardianRuleEngineRouter.ts

import { Router } from "express";
import { GuardianRuleEngineController } from "./guardianRuleEngineController";

export function guardianRuleEngineRouter() {
  const router = Router();

  router.post("/risk/rules/evaluate", async (req, res) => {
    const organizationId = req.headers["x-org-id"] as string;
    const controller = new GuardianRuleEngineController(organizationId);

    const context = {
      claimId: req.body.claimId,
      organizationId,
      payload: req.body.payload || {},
    };

    const result = await controller.evaluate(context);
    res.json(result);
  });

  router.get("/risk/rules/health", async (req, res) => {
    const organizationId = req.headers["x-org-id"] as string;
    const controller = new GuardianRuleEngineController(organizationId);
    const result = await controller.health();
    res.json(result);
  });

  return router;
}
