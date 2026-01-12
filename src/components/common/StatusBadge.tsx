import { Badge } from "@/components/ui/badge";
import { statusToLabel, statusToVariant } from "@/lib/badgeMaps";
import type { CandidateStatus } from "@/lib/badgeMaps";

interface StatusBadgeProps {
  status: CandidateStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <Badge variant={statusToVariant(status)} className={className}>
      {statusToLabel(status)}
    </Badge>
  );
}
