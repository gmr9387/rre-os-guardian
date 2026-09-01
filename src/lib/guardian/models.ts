// src/lib/guardian/models.ts

// ... keep existing RiskTier, GuardianFlag, Risk/Rules/Scoring/KillSwitch models

export type GuardianRepairDiffModel = {
  path: string;
  before: any;
  after: any;
};

export type GuardianRepairLineageModel = {
  claimId: string;
  organizationId: string;
  timestamp: string;
  diffs: GuardianRepairDiffModel[];
  notes: string[];
};

export type GuardianRepairModel = {
  claimId: string;
  organizationId: string;
  repairedClaimPayload: Record<string, any>;
  repairLineage: GuardianRepairLineageModel;
};

export function buildGuardianRepairModel(input: {
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
}): GuardianRepairModel {
  return {
    claimId: input.claimId,
    organizationId: input.organizationId,
    repairedClaimPayload: input.repairedClaimPayload,
    repairLineage: {
      claimId: input.repairLineage.claimId,
      organizationId: input.repairLineage.organizationId,
      timestamp: input.repairLineage.timestamp,
      diffs: input.repairLineage.diffs.map((d) => ({
        path: d.path,
        before: d.before,
        after: d.after,
      })),
      notes: [...input.repairLineage.notes],
    },
  };
}
