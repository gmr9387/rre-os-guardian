// src/nucleus/subsystems/guardian/guardianRiskScoringOpenApi.ts

export const GuardianRiskScoringOpenApi = {
  paths: {
    "/guardian/risk/scoring/run": {
      post: {
        summary: "Run Guardian risk scoring engine",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  claimId: { type: "string" },
                  flags: { type: "array", items: { type: "string" } },
                  baseScore: { type: "number" },
                },
                required: ["claimId", "flags"],
              },
            },
          },
        },
        responses: {
          200: { description: "Risk scoring result" },
        },
      },
    },
    "/guardian/risk/scoring/health": {
      get: {
        summary: "Guardian scoring health",
        responses: {
          200: { description: "Health status" },
        },
      },
    },
  },
};
