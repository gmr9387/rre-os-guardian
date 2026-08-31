// src/hooks/useGuardian.ts

import { useCallback, useEffect, useState } from "react";
import { GuardianRuntime, GuardianRuntimeState } from "../lib/guardian/runtime";

export function useGuardian(organizationId: string) {
  const [state, setState] = useState<GuardianRuntimeState>({
    loading: false,
    error: null,
    risk: null,
    rules: null,
    health: { status: "unknown", timestamp: null },
    rulesHealth: { status: "unknown", timestamp: null },
  });

  const runtime = new GuardianRuntime(organizationId);

  const evaluateClaim = useCallback(
    async (claimId: string, payload: Record<string, any>) => {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      const result = await runtime.evaluateClaim(claimId, payload);
      setState(result);
    },
    [runtime]
  );

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const [health, rulesHealth] = await Promise.all([
        runtime.checkHealth(),
        runtime.checkRulesHealth(),
      ]);
      if (!cancelled) {
        setState((prev) => ({
          ...prev,
          health,
          rulesHealth,
        }));
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [runtime]);

  return {
    ...state,
    evaluateClaim,
  };
}
