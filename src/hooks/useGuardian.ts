// src/hooks/useGuardian.ts
// extend state with lifecycle

const [state, setState] = useState<GuardianRuntimeState>({
  loading: false,
  error: null,
  risk: null,
  rules: null,
  scoring: null,
  killSwitch: null,
  repair: null,
  lifecycle: null,
  health: { status: "unknown", timestamp: null },
  rulesHealth: { status: "unknown", timestamp: null },
  scoringHealth: { status: "unknown", timestamp: null },
  killSwitchHealth: { status: "unknown", timestamp: null },
  repairHealth: { status: "unknown", timestamp: null },
  lifecycleHealth: { status: "unknown", timestamp: null },
});

// in effect:

const [
  health,
  rulesHealth,
  scoringHealth,
  killSwitchHealth,
  repairHealth,
  lifecycleHealth,
] = await Promise.all([
  runtime.checkHealth(),
  runtime.checkRulesHealth(),
  runtime.checkScoringHealth(),
  runtime.checkKillSwitchHealth(),
  runtime.checkRepairHealth(),
  runtime.checkLifecycleHealth(),
]);

setState((prev) => ({
  ...prev,
  health,
  rulesHealth,
  scoringHealth,
  killSwitchHealth,
  repairHealth,
  lifecycleHealth,
}));
