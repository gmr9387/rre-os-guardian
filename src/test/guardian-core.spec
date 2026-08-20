// src/__tests__/guardian-core.spec.ts
// RRE-OS Guardian — Core Test Suite (Generation 1)
//
// Focus:
//   - Scoring determinism
//   - Stopout → candidate → execution workflow
//   - Risk controls (kill switch)
//   - Basic invariants

import { describe, it, expect } from "vitest";
import { scoreCandidate } from "../lib/scoring"; // adjust path to your actual scoring module
import { buildCandidate } from "../lib/test-helpers/candidates"; // optional helper
import { applyRiskChecks } from "../lib/risk"; // adjust path
import { decideExecution } from "../lib/execution"; // adjust path

describe("Guardian core workflow", () => {
  it("produces deterministic scores for identical candidates", () => {
    const candidateA = buildCandidate({
      symbol: "AAPL",
      timeframe: "5m",
      stopoutDistance: 0.5,
      reentryDistance: 0.3,
      trendAlignment: "aligned",
    });

    const candidateB = buildCandidate({
      symbol: "AAPL",
      timeframe: "5m",
      stopoutDistance: 0.5,
      reentryDistance: 0.3,
      trendAlignment: "aligned",
    });

    const scoreA = scoreCandidate(candidateA);
    const scoreB = scoreCandidate(candidateB);

    expect(scoreA).toEqual(scoreB);
  });

  it("rejects candidates when kill switch is enabled", () => {
    const candidate = buildCandidate({
      symbol: "TSLA",
      timeframe: "15m",
      stopoutDistance: 0.8,
      reentryDistance: 0.4,
      trendAlignment: "aligned",
    });

    const riskState = {
      killSwitchEnabled: true,
      accountRiskBudgetRemaining: 1000,
    };

    const riskResult = applyRiskChecks(candidate, riskState);
    expect(riskResult.allowed).toBe(false);
    expect(riskResult.reason).toMatch(/kill/i);
  });

  it("allows execution when score and risk both pass", () => {
    const candidate = buildCandidate({
      symbol: "MSFT",
      timeframe: "15m",
      stopoutDistance: 0.4,
      reentryDistance: 0.2,
      trendAlignment: "aligned",
    });

    const score = scoreCandidate(candidate);
    const riskState = {
      killSwitchEnabled: false,
      accountRiskBudgetRemaining: 5000,
    };

    const riskResult = applyRiskChecks(candidate, riskState);
    const decision = decideExecution({
      candidate,
      score,
      risk: riskResult,
      mode: "manual",
    });

    expect(decision.authorized).toBe(true);
    expect(decision.path).toBe("manual");
  });

  it("blocks execution when risk fails even if score is high", () => {
    const candidate = buildCandidate({
      symbol: "NVDA",
      timeframe: "1h",
      stopoutDistance: 1.2,
      reentryDistance: 0.6,
      trendAlignment: "aligned",
    });

    const score = scoreCandidate(candidate);
    const riskState = {
      killSwitchEnabled: false,
      accountRiskBudgetRemaining: 0, // no budget left
    };

    const riskResult = applyRiskChecks(candidate, riskState);
    const decision = decideExecution({
      candidate,
      score,
      risk: riskResult,
      mode: "manual",
    });

    expect(score).toBeGreaterThan(0); // high score
    expect(riskResult.allowed).toBe(false);
    expect(decision.authorized).toBe(false);
  });
});
