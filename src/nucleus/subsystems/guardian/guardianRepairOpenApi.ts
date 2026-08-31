// src/nucleus/subsystems/guardian/guardianRepairOpenApi.ts

export const GuardianRepairOpenApi = {
  paths: {
    "/guardian/risk/repair/run": {
      post: {
        summary: "Run Guardian repair engine (full claim repair)",
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
                  claimPayload: { type: "object" },
                },
                required: ["claimId", "riskTier", "claimPayload"],
              },
            },
          },
        },
        responses: {
          200: { description: "Repaired claim payload and repair lineage" },
        },
      },
    },
    "/guardian/risk/repair/health": {
      get: {
        summary: "Guardian repair engine health",
        responses: {
          200: { description: "Health status" },
        },
      },
    },
  },
};
