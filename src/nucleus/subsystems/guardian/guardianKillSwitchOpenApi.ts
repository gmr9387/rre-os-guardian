// src/nucleus/subsystems/guardian/guardianKillSwitchOpenApi.ts

export const GuardianKillSwitchOpenApi = {
  paths: {
    "/guardian/risk/kill-switch/run": {
      post: {
        summary: "Run Guardian kill-switch decision engine",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  claimId: { type: "string" },
                  riskTier: { type: "string" },
                  flags: { type: "array", items: { type: "string" } },
                },
                required: ["claimId", "riskTier"],
              },
            },
          },
        },
        responses: {
          200: { description: "Kill-switch decision result" },
        },
      },
    },
    "/guardian/risk/kill-switch/health": {
      get: {
        summary: "Guardian kill-switch health",
        responses: {
          200: { description: "Health status" },
        },
      },
    },
  },
};
