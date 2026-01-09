import { useState } from "react";
import { BookOpen, TrendingUp, Target, BarChart3, ToggleLeft, ToggleRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

interface Strategy {
  id: string;
  tag: string;
  description: string;
  winrate: number;
  avgR: number;
  medianR: number;
  tradeCount: number;
  enabled: boolean;
}

const mockStrategies: Strategy[] = [
  {
    id: "s-1",
    tag: "London Reclaim",
    description: "Re-entry on session high/low reclaim after initial stop-out",
    winrate: 68,
    avgR: 1.4,
    medianR: 1.2,
    tradeCount: 45,
    enabled: true,
  },
  {
    id: "s-2",
    tag: "Structure Retest",
    description: "Retest of broken structure level for continuation",
    winrate: 62,
    avgR: 1.1,
    medianR: 0.9,
    tradeCount: 38,
    enabled: true,
  },
  {
    id: "s-3",
    tag: "Ladder Scale",
    description: "Progressive scaling into position with averaged entry",
    winrate: 55,
    avgR: 1.8,
    medianR: 1.5,
    tradeCount: 22,
    enabled: false,
  },
  {
    id: "s-4",
    tag: "News Fade",
    description: "Fading overextended moves after news-driven spikes",
    winrate: 48,
    avgR: 2.2,
    medianR: 1.8,
    tradeCount: 15,
    enabled: false,
  },
  {
    id: "s-5",
    tag: "Session Overlap",
    description: "Trading continuation during session transition periods",
    winrate: 71,
    avgR: 1.0,
    medianR: 0.8,
    tradeCount: 28,
    enabled: true,
  },
];

export default function Playbook() {
  const [strategies, setStrategies] = useState(mockStrategies);

  const toggleStrategy = (id: string) => {
    setStrategies(prev =>
      prev.map(s =>
        s.id === id ? { ...s, enabled: !s.enabled } : s
      )
    );
  };

  const getWinrateColor = (winrate: number) => {
    if (winrate >= 65) return "text-success";
    if (winrate >= 50) return "text-warning";
    return "text-danger";
  };

  const enabledCount = strategies.filter(s => s.enabled).length;

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
            {Math.round(strategies.reduce((a, b) => a + b.winrate, 0) / strategies.length)}%
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
                onCheckedChange={() => toggleStrategy(strategy.id)}
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
                  {strategy.winrate}%
                </span>
              </div>
              <div className="space-y-1">
                <p className="metric-label flex items-center gap-1">
                  <Target className="h-3 w-3" />
                  Avg R
                </p>
                <span className="metric-value text-lg">
                  {strategy.avgR.toFixed(1)}R
                </span>
              </div>
              <div className="space-y-1">
                <p className="metric-label">Median R</p>
                <span className="metric-value text-lg">
                  {strategy.medianR.toFixed(1)}R
                </span>
              </div>
              <div className="space-y-1">
                <p className="metric-label flex items-center gap-1">
                  <BarChart3 className="h-3 w-3" />
                  Trades
                </p>
                <span className="metric-value text-lg">{strategy.tradeCount}</span>
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
                      strategy.winrate >= 50 ? "bg-warning" : "bg-danger"
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
    </div>
  );
}
