// Badge variant mapping helpers for type-safe Badge usage.
// Source of truth: src/components/ui/badge.tsx (badgeVariants.variants.variant keys)

export type BadgeVariant =
  | "default"
  | "secondary"
  | "destructive"
  | "outline"
  | "assist"
  | "auto"
  | "safe"
  | "conservative"
  | "normal"
  | "aggressive"
  | "healthy"
  | "elevated"
  | "locked"
  | "buy"
  | "sell"
  | "live"
  | "test"
  | "train"
  | "reclaim"
  | "retest"
  | "ladder"
  | "warning";

// Candidate status (DB values) => badge variants
export function statusToVariant(status: string): BadgeVariant {
  switch (status) {
    case "blocked":
      return "destructive";
    case "executed":
      // Stored as "executed" (DB-safe) but displayed as "Confirmed" in UI.
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

// Candidate status (DB values) => display labels
export function statusToLabel(status: string): string {
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
