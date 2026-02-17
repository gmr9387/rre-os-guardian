import { 
  Fingerprint, 
  TrendingUp, 
  Clock, 
  Target, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Zap,
  Loader2
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useAccountInsights } from "@/hooks/useAccountInsights";

export default function Insights() {
  const { insights, isLoading, error } = useAccountInsights();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !insights) {
    return (
      <div className="glass-card p-8 text-center">
        <Fingerprint className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="font-medium mb-2">Unable to Load Insights</h3>
        <p className="text-sm text-muted-foreground">
          {error?.message || "Please try again later."}
        </p>
      </div>
    );
  }

  const strengths = insights.alpha_fingerprint?.strengths ?? [];
  const weaknesses = insights.alpha_fingerprint?.weaknesses ?? [];
  const avoidConditions = insights.avoid_conditions ?? [];
  const hasTradeData = insights.best_symbols.length > 0;

  return (
    <div className="space-y-4 pb-20 lg:pb-6">
      {/* Header */}
      <div>
        <h1 className="flex items-center gap-2 text-xl font-bold">
          <Fingerprint className="h-6 w-6 text-primary" />
          Alpha Fingerprint
        </h1>
        <p className="text-sm text-muted-foreground">
          Your personalized trading identity based on historical performance
        </p>
      </div>

      {/* Strengths & Weaknesses */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Strengths */}
        <div className="glass-card p-4">
          <h3 className="mb-3 flex items-center gap-2 font-medium text-success">
            <CheckCircle className="h-5 w-5" />
            Strengths
          </h3>
          <ul className="space-y-2">
            {strengths.length > 0 ? strengths.map((strength, idx) => (
              <li key={idx} className="flex items-start gap-2 text-sm">
                <Zap className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                {strength}
              </li>
            )) : (
              <li className="text-sm text-muted-foreground">No strengths data yet. Complete more trades.</li>
            )}
          </ul>
        </div>

        {/* Weaknesses */}
        <div className="glass-card p-4">
          <h3 className="mb-3 flex items-center gap-2 font-medium text-warning">
            <AlertTriangle className="h-5 w-5" />
            Areas for Improvement
          </h3>
          <ul className="space-y-2">
            {weaknesses.length > 0 ? weaknesses.map((weakness, idx) => (
              <li key={idx} className="flex items-start gap-2 text-sm">
                <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
                {weakness}
              </li>
            )) : (
              <li className="text-sm text-muted-foreground">No improvement areas identified yet.</li>
            )}
          </ul>
        </div>
      </div>

      {/* Best Symbols */}
      <div className="glass-card p-4">
        <h3 className="mb-3 flex items-center gap-2 font-medium">
          <TrendingUp className="h-5 w-5 text-primary" />
          Best Performing Symbols
        </h3>
        {hasTradeData ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {insights.best_symbols.map((item) => (
              <div key={item.symbol} className="rounded-lg border border-border/50 bg-muted/30 p-3 text-center">
                <span className="font-mono font-bold">{item.symbol}</span>
                <div className="mt-1 flex items-center justify-center gap-2">
                  <span className={cn(
                    "text-sm font-medium",
                    item.winrate >= 65 ? "text-success" : 
                    item.winrate >= 50 ? "text-primary" : "text-warning"
                  )}>
                    {item.winrate}%
                  </span>
                  <span className="text-xs text-muted-foreground">({item.trades})</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Complete more trades to see symbol performance data.
          </p>
        )}
      </div>

      {/* Best Sessions */}
      <div className="glass-card p-4">
        <h3 className="mb-3 flex items-center gap-2 font-medium">
          <Clock className="h-5 w-5 text-primary" />
          Session Performance
        </h3>
        {insights.best_sessions.length > 0 ? (
          <div className="space-y-3">
            {insights.best_sessions.map((session) => (
              <div key={session.session} className="flex items-center gap-4">
                <span className="w-32 text-sm">{session.session}</span>
                <div className="flex-1">
                  <div className="h-3 overflow-hidden rounded-full bg-muted">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all",
                        session.winrate >= 65 ? "bg-success" :
                        session.winrate >= 50 ? "bg-primary" : "bg-warning"
                      )}
                      style={{ width: `${session.winrate}%` }}
                    />
                  </div>
                </div>
                <span className={cn(
                  "w-12 text-right font-mono text-sm font-medium",
                  session.winrate >= 65 ? "text-success" :
                  session.winrate >= 50 ? "text-primary" : "text-warning"
                )}>
                  {session.winrate}%
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Complete more trades to see session performance data.
          </p>
        )}
      </div>

      {/* RR Band Stats & Candidate Types */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Candidate Types */}
        <div className="glass-card p-4">
          <h3 className="mb-3 flex items-center gap-2 font-medium">
            <Target className="h-5 w-5 text-primary" />
            Candidate Type Performance
          </h3>
          {insights.best_candidate_types.length > 0 ? (
            <div className="space-y-3">
              {insights.best_candidate_types.map((item) => (
                <div key={item.type} className="flex items-center justify-between rounded-lg border border-border/50 bg-muted/30 p-3">
                  <Badge variant={item.type.toLowerCase() as "reclaim" | "retest" | "ladder"}>{item.type}</Badge>
                  <span className={cn(
                    "font-mono font-medium",
                    item.avgR >= 1.5 ? "text-success" : 
                    item.avgR >= 1.0 ? "text-primary" : "text-warning"
                  )}>
                    {item.avgR.toFixed(1)}R avg
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Complete more trades to see candidate type performance.
            </p>
          )}
        </div>

        {/* RR Band Stats */}
        <div className="glass-card p-4">
          <h3 className="mb-3 font-medium">RR Band Performance</h3>
          {insights.rr_band_stats.length > 0 ? (
            <div className="space-y-3">
              {insights.rr_band_stats.map((band) => (
                <div key={band.band} className="flex items-center gap-4">
                  <span className="w-20 font-mono text-sm">{band.band}</span>
                  <div className="flex-1">
                    <div className="h-3 overflow-hidden rounded-full bg-muted">
                      <div
                        className={cn(
                          "h-full rounded-full",
                          band.winrate >= 65 ? "bg-success" :
                          band.winrate >= 50 ? "bg-primary" : "bg-warning"
                        )}
                        style={{ width: `${band.winrate}%` }}
                      />
                    </div>
                  </div>
                  <span className="w-12 text-right font-mono text-sm">{band.winrate}%</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Complete more trades to see RR band performance.
            </p>
          )}
        </div>
      </div>

      {/* Avoid Conditions */}
      <div className="glass-card border-danger/30 bg-danger/5 p-4">
        <h3 className="mb-3 flex items-center gap-2 font-medium text-danger">
          <AlertTriangle className="h-5 w-5" />
          Conditions to Avoid
        </h3>
        <div className="flex flex-wrap gap-2">
          {avoidConditions.length > 0 ? avoidConditions.map((condition, idx) => (
            <Badge key={idx} variant="locked" className="text-sm">
              {condition}
            </Badge>
          )) : (
            <p className="text-sm text-muted-foreground">No avoid conditions identified yet.</p>
          )}
        </div>
      </div>

      {/* Getting Started Callout */}
      {!hasTradeData && (
        <div className="glass-card border-primary/30 bg-primary/5 p-4">
          <h3 className="mb-2 flex items-center gap-2 font-medium text-primary">
            <Zap className="h-5 w-5" />
            Getting Started
          </h3>
          <p className="text-sm text-muted-foreground">
            Your Alpha Fingerprint will become more accurate as you complete trades. 
            The system learns from your performance patterns to provide personalized insights.
          </p>
        </div>
      )}
    </div>
  );
}
