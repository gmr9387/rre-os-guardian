// src/nucleus/subsystems/guardian/guardianRuleEngineOpenApi.ts

export const GuardianRuleEngineOpenApi = {
  paths: {
    "/guardian/risk/rules/evaluate": {
      post: {
        summary: "Evaluate Guardian deterministic rules for a claim",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  claimId: { type: "string" },
                  payload: { type: "object" },
                },
                required: ["claimId", "payload"],
              },
            },
          },
        },
        responses: {
          200: {
            description: "Deterministic rule evaluation result",
          },
        },
      },
    },
    "/guardian/risk/rules/health": {
      get: {
        summary: "Guardian rule engine health",
        responses: {
          200: {
            description: "Health status",
          },
        },
      },
    },
  },
};
