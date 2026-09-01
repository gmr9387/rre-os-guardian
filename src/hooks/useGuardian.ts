// src/hooks/useGuardian.ts

import { useCallback, useEffect, useState } from "react";
import { GuardianRuntime, GuardianRuntimeState } from "../lib/guardian/runtime";

export function useGuardian(organizationId: string) {
  const [state, setState] = useState<GuardianRuntimeState>({
    loading: false,
    error: null,
    risk: null,
    rules: null,
    scoring: null,
    killSwitch: null,
    repair: null,
    health: { status: "unknown", timestamp: null },
    rulesHealth: { status: "unknown", timestamp: null },
    scoringHealth: { status: "unknown", timestamp: null },
    killSwitchHealth: { status: "unknown", timestamp: null },
    repairHealth: { status: "unknown", timestamp: null },
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
      const [
        health,
        rulesHealth,
        scoringHealth,
        killSwitchHealth,
        repairHealth,
      ] = await Promise.all([
        runtime.checkHealth(),
        runtime.checkRulesHealth(),
        runtime.checkScoringHealth(),
        runtime.checkKillSwitchHealth(),
        runtime.checkRepairHealth(),
      ]);

      if (!cancelled) {
        setState((prev) => ({
          ...prev,
          health,
          rulesHealth,
          scoringHealth,
          killSwitchHealth,
          repairHealth,
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
