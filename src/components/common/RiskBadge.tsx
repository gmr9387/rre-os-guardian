import { Badge } from "@/components/ui/badge";
import { riskToVariant } from "@/lib/badgeMaps";

export function RiskBadge({ risk }: { risk: string }) {
  return <Badge variant={riskToVariant(risk)}>{risk}</Badge>;
}
