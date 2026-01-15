import { Badge } from "@/components/ui/badge";
import { statusToLabel, statusToVariant } from "@/lib/badgeMaps";
import type { Database } from "@/integrations/supabase/types";

type CandidateStatus = Database["public"]["Enums"]["candidate_status"];

export function StatusBadge({ status }: { status: CandidateStatus }) {
  return <Badge variant={statusToVariant(status)}>{statusToLabel(status)}</Badge>;
}
