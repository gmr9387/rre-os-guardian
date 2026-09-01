// src/lib/guardian/models.ts
// add lifecycle model

export type GuardianLifecycleState =
  | "INGESTED"
  | "EVALUATED"
  | "REPAIRED"
  | "ENFORCED"
  | "FINALIZED"
  | "REOPENED";

export type GuardianLifecycleEventModel = {
  from: GuardianLifecycleState;
  to: GuardianLifecycleState;
  timestamp: string;
  reason: string;
};

export type GuardianUnifiedClaimModel = {
  originalClaimPayload: Record<string, any>;
  repairedClaimPayload: Record<string, any> | null;
  lifecycleState: GuardianLifecycleState;
  lifecycleEvents: GuardianLifecycleEventModel[];
};

export type GuardianLifecycleModel = {
  claimId: string;
  organizationId: string;
  unifiedClaim: GuardianUnifiedClaimModel;
};

export function buildGuardianLifecycleModel(input: {
  claimId: string;
  organizationId: string;
  unifiedClaim: {
    originalClaimPayload: Record<string, any>;
    repairedClaimPayload: Record<string, any> | null;
    lifecycleState: GuardianLifecycleState;
    lifecycleEvents: {
      from: GuardianLifecycleState;
      to: GuardianLifecycleState;
      timestamp: string;
      reason: string;
    }[];
  };
}): GuardianLifecycleModel {
  return {
    claimId: input.claimId,
    organizationId: input.organizationId,
    unifiedClaim: {
      originalClaimPayload: input.unifiedClaim.originalClaimPayload,
      repairedClaimPayload: input.unifiedClaim.repairedClaimPayload,
      lifecycleState: input.unifiedClaim.lifecycleState,
      lifecycleEvents: input.unifiedClaim.lifecycleEvents.map((e) => ({
        from: e.from,
        to: e.to,
        timestamp: e.timestamp,
        reason: e.reason,
      })),
    },
  };
}
