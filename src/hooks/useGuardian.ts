// src/hooks/useGuardian.ts

import { useCallback, useEffect, useState } from "react";
import { GuardianRuntime, GuardianRuntimeState } from "../lib/guardian/runtime";

export function useGuardian(organizationId: string) {
  const [state, setState] = useState<GuardianRuntimeState>({
    loading: false,
    error: null,
    risk: null,
    health: { status: "unknown", timestamp: null },
  });

  const runtime = new GuardianRuntime(organizationId);

  const evaluateClaim = useCallback(
    async (claimId: string, payload: Record<string, any>) => {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      const result = await runtime.evaluateClaim(claimId, payload);
      const health = await runtime.checkHealth();
      setState({
        ...result,
        health,
      });
    },
    [runtime]
  );

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const health = await runtime.checkHealth();
      if (!cancelled) {
        setState((prev) => ({
          ...prev,
          health,
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
