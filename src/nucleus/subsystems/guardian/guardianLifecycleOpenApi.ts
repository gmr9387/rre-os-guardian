// src/nucleus/subsystems/guardian/guardianLifecycleOpenApi.ts

export const GuardianLifecycleOpenApi = {
  paths: {
    "/guardian/claim/lifecycle/run": {
      post: {
        summary: "Run Guardian unified claim lifecycle engine",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  claimId: { type: "string" },
                  claimPayload: { type: "object" },
                },
                required: ["claimId", "claimPayload"],
              },
            },
          },
        },
        responses: {
          200: { description: "Unified claim lifecycle result" },
        },
      },
    },
    "/guardian/claim/lifecycle/health": {
      get: {
        summary: "Guardian lifecycle health",
        responses: {
          200: { description: "Health status" },
        },
      },
    },
  },
};
