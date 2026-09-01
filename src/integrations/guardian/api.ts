// src/integrations/guardian/api.ts

// ... keep existing types from Phase 4 and add:

export type GuardianRepairResponse = {
  claimId: string;
  organizationId: string;
  repairedClaimPayload: Record<string, any>;
  repairLineage: {
    claimId: string;
    organizationId: string;
    timestamp: string;
    diffs: { path: string; before: any; after: any }[];
    notes: string[];
  };
};

// keep GUARDIAN_BASE_URL + handleResponse + existing functions

export async function runGuardianRepair(request: {
  claimId: string;
  organizationId: string;
  riskTier: string;
  flags: string[];
  claimPayload: Record<string, any>;
}): Promise<GuardianRepairResponse> {
  const res = await fetch(
    `${GUARDIAN_BASE_URL}/guardian/risk/repair/run`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-org-id": request.organizationId,
      },
      body: JSON.stringify(request),
    }
  );

  return handleResponse<GuardianRepairResponse>(res);
}

export async function getGuardianRepairHealth(
  organizationId: string
): Promise<GuardianHealthResponse> {
  const res = await fetch(
    `${GUARDIAN_BASE_URL}/guardian/risk/repair/health`,
    {
      method: "GET",
      headers: {
        "x-org-id": organizationId,
      },
    }
  );

  return handleResponse<GuardianHealthResponse>(res);
}
