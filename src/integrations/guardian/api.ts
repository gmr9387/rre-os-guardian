// src/integrations/guardian/api.ts
// add lifecycle support (full file if you prefer, here is the lifecycle part)

export type GuardianLifecycleResponse = {
  claimId: string;
  organizationId: string;
  unifiedClaim: {
    originalClaimPayload: Record<string, any>;
    repairedClaimPayload: Record<string, any> | null;
    lifecycleState:
      | "INGESTED"
      | "EVALUATED"
      | "REPAIRED"
      | "ENFORCED"
      | "FINALIZED"
      | "REOPENED";
    lifecycleEvents: {
      from:
        | "INGESTED"
        | "EVALUATED"
        | "REPAIRED"
        | "ENFORCED"
        | "FINALIZED"
        | "REOPENED";
      to:
        | "INGESTED"
        | "EVALUATED"
        | "REPAIRED"
        | "ENFORCED"
        | "FINALIZED"
        | "REOPENED";
      timestamp: string;
      reason: string;
    }[];
  };
};

export async function runGuardianLifecycle(request: {
  claimId: string;
  organizationId: string;
  claimPayload: Record<string, any>;
}): Promise<GuardianLifecycleResponse> {
  const res = await fetch(
    `${GUARDIAN_BASE_URL}/guardian/claim/lifecycle/run`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-org-id": request.organizationId,
      },
      body: JSON.stringify(request),
    }
  );

  return handleResponse<GuardianLifecycleResponse>(res);
}

export async function getGuardianLifecycleHealth(
  organizationId: string
): Promise<GuardianHealthResponse> {
  const res = await fetch(
    `${GUARDIAN_BASE_URL}/guardian/claim/lifecycle/health`,
    {
      method: "GET",
      headers: {
        "x-org-id": organizationId,
      },
    }
  );

  return handleResponse<GuardianHealthResponse>(res);
}
