// src/integrations/guardian/api.ts

export type GuardianRiskRequest = {
  claimId: string;
  organizationId: string;
  payload: Record<string, any>;
};

export type GuardianRiskResponse = {
  claimId: string;
  riskScore: number;
  riskTier: "low" | "medium" | "high" | "critical";
  flags: string[];
  details?: Record<string, any>;
};

export type GuardianRuleEngineResponse = {
  claimId: string;
  organizationId: string;
  rulesEvaluated: number;
  passed: string[];
  failed: string[];
  flags: string[];
  riskScore: number;
  riskTier: "low" | "medium" | "high" | "critical";
  details?: Record<string, any>;
};

export type GuardianHealthResponse = {
  status: "healthy" | "degraded" | "down";
  runtime: string;
  timestamp: string;
};

const GUARDIAN_BASE_URL =
  import.meta.env.VITE_GUARDIAN_BASE_URL || "https://api.valtaris.local";

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const text = await res.text();
    throw new Error(
      `Guardian API error: ${res.status} ${res.statusText} - ${text}`
    );
  }
  return res.json() as Promise<T>;
}

export async function runGuardianRisk(
  request: GuardianRiskRequest
): Promise<GuardianRiskResponse> {
  const res = await fetch(`${GUARDIAN_BASE_URL}/guardian/risk/run`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-org-id": request.organizationId,
    },
    body: JSON.stringify(request.payload),
  });

  return handleResponse<GuardianRiskResponse>(res);
}

export async function runGuardianRules(
  request: GuardianRiskRequest
): Promise<GuardianRuleEngineResponse> {
  const res = await fetch(
    `${GUARDIAN_BASE_URL}/guardian/risk/rules/evaluate`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-org-id": request.organizationId,
      },
      body: JSON.stringify({
        claimId: request.claimId,
        payload: request.payload,
      }),
    }
  );

  return handleResponse<GuardianRuleEngineResponse>(res);
}

export async function getGuardianHealth(
  organizationId: string
): Promise<GuardianHealthResponse> {
  const res = await fetch(`${GUARDIAN_BASE_URL}/guardian/risk/health`, {
    method: "GET",
    headers: {
      "x-org-id": organizationId,
    },
  });

  return handleResponse<GuardianHealthResponse>(res);
}

export async function getGuardianRulesHealth(
  organizationId: string
): Promise<GuardianHealthResponse> {
  const res = await fetch(`${GUARDIAN_BASE_URL}/guardian/risk/rules/health`, {
    method: "GET",
    headers: {
      "x-org-id": organizationId,
    },
  });

  return handleResponse<GuardianHealthResponse>(res);
}
