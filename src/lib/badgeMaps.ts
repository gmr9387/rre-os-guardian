import type { BadgeVariant } from "@/components/ui/badge";
import type { Database } from "@/integrations/supabase/types";

export type CandidateStatus = Database["public"]["Enums"]["candidate_status"];

export function statusToVariant(status: CandidateStatus): BadgeVariant {
  switch (status) {
    case "blocked":
      return "destructive";
    case "executed":
      // Stored as "executed" (DB-safe), displayed as "Confirmed" in UI.
      return "default";
    case "pending":
      return "secondary";
    case "ignored":
    case "expired":
      return "outline";
    default:
      return "secondary";
  }
}

export function statusToLabel(status: CandidateStatus): string {
  switch (status) {
    case "executed":
      return "Confirmed";
    case "pending":
      return "Pending";
    case "ignored":
      return "Ignored";
    case "expired":
      return "Expired";
    case "blocked":
      return "Blocked";
    default:
      return status;
  }
}

export function modeToVariant(mode: string): BadgeVariant {
  switch (mode) {
    case "assist":
      return "assist";
    case "auto":
      return "auto";
    case "safe":
      return "safe";
    case "live":
      return "live";
    case "test":
      return "test";
    case "train":
      return "train";
    default:
      return "secondary";
  }
}

export function riskToVariant(risk: string): BadgeVariant {
  switch (risk) {
    case "conservative":
      return "conservative";
    case "normal":
      return "normal";
    case "aggressive":
      return "aggressive";
    default:
      return "normal";
  }
}

export function candidateTypeToVariant(type: string): BadgeVariant {
  switch (type) {
    case "reclaim":
      return "reclaim";
    case "retest":
      return "retest";
    case "ladder":
      return "ladder";
    default:
      return "secondary";
  }
}

export function sideToVariant(side: string): BadgeVariant {
  return side.toLowerCase() === "buy" ? "buy" : "sell";
}
