import { Badge } from "@/components/ui/badge";
import { modeToVariant } from "@/lib/badgeMaps";

export function ModeBadge({ mode }: { mode: string }) {
  return <Badge variant={modeToVariant(mode)}>{mode.toUpperCase()}</Badge>;
}
