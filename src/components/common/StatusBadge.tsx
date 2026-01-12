import { Badge } from "@/components/ui/badge";
import { statusToLabel, statusToVariant } from "@/lib/badgeMaps";
import type { CandidateStatus } from "@/lib/badgeMaps";

export function StatusBadge({ status }: { status: CandidateStatus }) {
  return <Badge variant={statusToVariant(status)}>{statusToLabel(status)}</Badge>;
}
