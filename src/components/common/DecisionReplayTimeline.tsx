import { Badge } from "@/components/ui/badge";

export function DecisionReplayTimeline({ rules, tags }: { rules: string[]; tags?: string[] }) {
  if (!rules || rules.length === 0) {
    return <div className="glass-card p-4 text-sm text-muted-foreground">No decision rules recorded.</div>;
  }

  return (
    <div className="glass-card p-4">
      <div className="mb-3 flex justify-between">
        <div>
          <div className="text-sm font-semibold">Decision Replay</div>
          <div className="text-xs text-muted-foreground">Why this candidate was generated</div>
        </div>
        {tags && tags.length > 0 && (
          <div className="flex gap-1">
            {tags.slice(0, 4).map((t) => (
              <Badge key={t} variant="outline" className="text-xs">{t}</Badge>
            ))}
          </div>
        )}
      </div>
      <ol className="border-l border-border ml-2">
        {rules.map((r, i) => (
          <li key={i} className="ml-4 mb-3 text-sm">
            <span className="mr-2 text-xs text-muted-foreground">{String(i + 1).padStart(2, "0")}</span>
            {r}
          </li>
        ))}
      </ol>
    </div>
  );
}
