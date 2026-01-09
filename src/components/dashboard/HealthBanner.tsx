import { TrendingUp, TrendingDown, Activity, AlertTriangle, Lock, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface HealthMetrics {
  dailyPnl: number;
  realizedR: number;
  lossStreak: number;
  maxDrawdown: number;
  evi: number; // Emotional Volatility Index
  status: "healthy" | "elevated" | "locked";
}

interface HealthBannerProps {
  metrics: HealthMetrics;
}

export function HealthBanner({ metrics }: HealthBannerProps) {
  const { dailyPnl, realizedR, lossStreak, maxDrawdown, evi, status } = metrics;

  const getStatusConfig = () => {
    switch (status) {
      case "healthy":
        return {
          bg: "bg-success/5 border-success/20",
          icon: Activity,
          iconColor: "text-success",
          label: "Healthy",
        };
      case "elevated":
        return {
          bg: "bg-warning/5 border-warning/20",
          icon: AlertTriangle,
          iconColor: "text-warning",
          label: "Elevated Risk",
        };
      case "locked":
        return {
          bg: "bg-danger/5 border-danger/20",
          icon: Lock,
          iconColor: "text-danger",
          label: "System Locked",
        };
    }
  };

  const statusConfig = getStatusConfig();
  const StatusIcon = statusConfig.icon;

  return (
    <div className={cn(
      "glass-card border p-4 animate-slide-up",
      statusConfig.bg
    )}>
      {/* Status Header */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <StatusIcon className={cn("h-5 w-5", statusConfig.iconColor)} />
          <span className="font-medium">Re-Entry Health</span>
        </div>
        <Badge variant={status}>{statusConfig.label}</Badge>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {/* Daily P/L */}
        <div className="space-y-1">
          <p className="metric-label">Daily P/L</p>
          <div className="flex items-center gap-1">
            {dailyPnl >= 0 ? (
              <TrendingUp className="h-4 w-4 text-success" />
            ) : (
              <TrendingDown className="h-4 w-4 text-danger" />
            )}
            <span className={cn(
              "metric-value text-lg",
              dailyPnl >= 0 ? "text-success" : "text-danger"
            )}>
              {dailyPnl >= 0 ? "+" : ""}{dailyPnl.toFixed(2)}%
            </span>
          </div>
        </div>

        {/* Realized R */}
        <div className="space-y-1">
          <p className="metric-label">Realized R</p>
          <span className={cn(
            "metric-value text-lg",
            realizedR >= 0 ? "text-success" : "text-danger"
          )}>
            {realizedR >= 0 ? "+" : ""}{realizedR.toFixed(1)}R
          </span>
        </div>

        {/* Loss Streak */}
        <div className="space-y-1">
          <p className="metric-label">Loss Streak</p>
          <span className={cn(
            "metric-value text-lg",
            lossStreak === 0 ? "text-success" : lossStreak < 3 ? "text-warning" : "text-danger"
          )}>
            {lossStreak}
          </span>
        </div>

        {/* Max Drawdown */}
        <div className="space-y-1">
          <p className="metric-label">Max DD</p>
          <span className={cn(
            "metric-value text-lg",
            maxDrawdown < 3 ? "text-success" : maxDrawdown < 5 ? "text-warning" : "text-danger"
          )}>
            {maxDrawdown.toFixed(1)}%
          </span>
        </div>

        {/* EVI */}
        <div className="space-y-1">
          <p className="metric-label flex items-center gap-1">
            <Zap className="h-3 w-3" />
            EVI
          </p>
          <span className={cn(
            "metric-value text-lg",
            evi < 30 ? "text-success" : evi < 60 ? "text-warning" : "text-danger"
          )}>
            {evi}
          </span>
        </div>

        {/* Visual Indicator */}
        <div className="space-y-1">
          <p className="metric-label">Volatility</p>
          <div className="flex gap-0.5">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className={cn(
                  "h-6 w-2 rounded-sm transition-colors",
                  i < Math.ceil(evi / 20)
                    ? evi < 30 ? "bg-success" : evi < 60 ? "bg-warning" : "bg-danger"
                    : "bg-muted"
                )}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
