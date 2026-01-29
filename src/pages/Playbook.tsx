import { BookOpen, TrendingUp, Target, BarChart3, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { usePlaybookStrategies } from "@/hooks/usePlaybookStrategies";

export default function Playbook() {
  const { strategies, isLoading, toggleStrategy, isToggling } = usePlaybookStrategies();

  const getWinrateColor = (winrate: number) => {
    if (winrate >= 65) return "text-success";
    if (winrate >= 50) return "text-warning";
    return "text-danger";
  };

  const enabledCount = strategies.filter(s => s.enabled).length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-20 lg:pb-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-xl font-bold">
            <BookOpen className="h-6 w-6 text-primary" />
            Playbook
          </h1>
          <p className="text-sm text-muted-foreground">
            {enabledCount} of {strategies.length} strategies active
          </p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="glass-card p-4 text-center">
          <p className="metric-label">Total Strategies</p>
          <span className="metric-value text-2xl">{strategies.length}</span>
        </div>
        <div className="glass-card p-4 text-center">
          <p className="metric-label">Active</p>
          <span className="metric-value text-2xl text-success">{enabledCount}</span>
        </div>
        <div className="glass-card p-4 text-center">
          <p className="metric-label">Avg Winrate</p>
          <span className="metric-value text-2xl">
            {strategies.length > 0 
              ? Math.round(strategies.reduce((a, b) => a + b.winrate, 0) / strategies.length) || 0
              : 0}%
          </span>
        </div>
        <div className="glass-card p-4 text-center">
          <p className="metric-label">Total Trades</p>
          <span className="metric-value text-2xl">
            {strategies.reduce((a, b) => a + b.tradeCount, 0)}
          </span>
        </div>
      </div>

      {/* Strategy Cards */}
      <div className="space-y-3">
        {strategies.map((strategy) => (
          <div
            key={strategy.id}
            className={cn(
              "glass-card overflow-hidden transition-all",
              !strategy.enabled && "opacity-60"
            )}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border/50 p-4">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-lg",
                  strategy.enabled ? "bg-primary/20" : "bg-muted"
                )}>
                  <BookOpen className={cn(
                    "h-5 w-5",
                    strategy.enabled ? "text-primary" : "text-muted-foreground"
                  )} />
                </div>
                <div>
                  <h3 className="font-medium">{strategy.tag}</h3>
                  <p className="text-xs text-muted-foreground">{strategy.description}</p>
                </div>
              </div>
              <Switch
                checked={strategy.enabled}
                onCheckedChange={(checked) => toggleStrategy(strategy.tag, checked)}
                disabled={isToggling}
              />
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-2 gap-4 p-4 sm:grid-cols-4">
              <div className="space-y-1">
                <p className="metric-label flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  Winrate
                </p>
                <span className={cn("metric-value text-lg", getWinrateColor(strategy.winrate))}>
                  {strategy.winrate > 0 ? `${strategy.winrate}%` : '—'}
                </span>
              </div>
              <div className="space-y-1">
                <p className="metric-label flex items-center gap-1">
                  <Target className="h-3 w-3" />
                  Avg R
                </p>
                <span className="metric-value text-lg">
                  {strategy.avgR > 0 ? `${strategy.avgR.toFixed(1)}R` : '—'}
                </span>
              </div>
              <div className="space-y-1">
                <p className="metric-label">Median R</p>
                <span className="metric-value text-lg">
                  {strategy.medianR > 0 ? `${strategy.medianR.toFixed(1)}R` : '—'}
                </span>
              </div>
              <div className="space-y-1">
                <p className="metric-label flex items-center gap-1">
                  <BarChart3 className="h-3 w-3" />
                  Trades
                </p>
                <span className="metric-value text-lg">{strategy.tradeCount || '—'}</span>
              </div>
            </div>

            {/* Performance Bar */}
            <div className="border-t border-border/50 bg-muted/30 p-3">
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Performance</span>
                <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all",
                      strategy.winrate >= 65 ? "bg-success" : 
                      strategy.winrate >= 50 ? "bg-warning" : "bg-muted-foreground/30"
                    )}
                    style={{ width: `${strategy.winrate}%` }}
                  />
                </div>
                <Badge 
                  variant={strategy.enabled ? "assist" : "outline"} 
                  className="text-[10px]"
                >
                  {strategy.enabled ? "Active" : "Disabled"}
                </Badge>
              </div>
            </div>
          </div>
        ))}
      </div>

      {strategies.length === 0 && (
        <div className="glass-card p-8 text-center">
          <BookOpen className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="font-medium mb-2">No Strategies Yet</h3>
          <p className="text-sm text-muted-foreground">
            Strategies will appear here as you configure your playbook.
          </p>
        </div>
      )}
    </div>
  );
}
