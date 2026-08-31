// src/test/guardian.test.ts

import { describe, it, expect } from "vitest";
import { mapRiskTier, normalizeFlags, buildGuardianRiskModel } from "../lib/guardian/models";

describe("Guardian models", () => {
  it("maps risk tier from score", () => {
    expect(mapRiskTier(0.1)).toBe("low");
    expect(mapRiskTier(0.3)).toBe("medium");
    expect(mapRiskTier(0.6)).toBe("high");
    expect(mapRiskTier(0.9)).toBe("critical");
  });

  it("normalizes flags", () => {
    const flags = normalizeFlags(["fraud_suspected", "high_cost"]);
    expect(flags).toHaveLength(2);
    expect(flags[0].code).toBe("fraud_suspected");
    expect(flags[0].label).toBe("FRAUD SUSPECTED");
  });

  it("builds risk model", () => {
    const model = buildGuardianRiskModel({
      claimId: "CLAIM-123",
      riskScore: 0.75,
      riskTier: "high",
      flags: ["fraud_suspected"],
      details: { foo: "bar" },
    });

    expect(model.claimId).toBe("CLAIM-123");
    expect(model.riskTier).toBe("high");
    expect(model.flags[0].code).toBe("fraud_suspected");
    expect(model.details?.foo).toBe("bar");
  });
});
