import { RefreshCw, Timer, AlertCircle, Shield, Lock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface RiskMetrics {
  reentriesUsed: number;
  maxReentries: number;
  cooldownSeconds: number;
  manualOverrideActive: boolean;
  trustScore: number;
  lockedRiskMode: boolean;
}

interface RiskSnapshotProps {
  metrics: RiskMetrics;
}

export function RiskSnapshot({ metrics }: RiskSnapshotProps) {
  const { 
    reentriesUsed, 
    maxReentries, 
    cooldownSeconds, 
    manualOverrideActive,
    trustScore,
    lockedRiskMode 
  } = metrics;

  const reentryPercentage = (reentriesUsed / maxReentries) * 100;
  const formatCooldown = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="glass-card p-4 animate-slide-up" style={{ animationDelay: '100ms' }}>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="flex items-center gap-2 font-medium">
          <Shield className="h-4 w-4 text-primary" />
          Today's Risk Snapshot
        </h3>
        {lockedRiskMode && (
          <Badge variant="locked" className="gap-1">
            <Lock className="h-3 w-3" />
            Risk Locked
          </Badge>
        )}
      </div>

      <div className="space-y-4">
        {/* Re-entries Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2 text-muted-foreground">
              <RefreshCw className="h-4 w-4" />
              Re-entries Today
            </span>
            <span className="font-mono font-medium">
              <span className={cn(
                reentryPercentage > 80 ? "text-danger" : reentryPercentage > 50 ? "text-warning" : "text-foreground"
              )}>
                {reentriesUsed}
              </span>
              <span className="text-muted-foreground"> / {maxReentries}</span>
            </span>
          </div>
          <Progress 
            value={reentryPercentage} 
            className={cn(
              "h-2",
              reentryPercentage > 80 ? "[&>div]:bg-danger" : 
              reentryPercentage > 50 ? "[&>div]:bg-warning" : 
              "[&>div]:bg-primary"
            )}
          />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {/* Cooldown Timer */}
          <div className="space-y-1">
            <p className="metric-label flex items-center gap-1">
              <Timer className="h-3 w-3" />
              Cooldown
            </p>
            <span className={cn(
              "metric-value text-lg font-mono",
              cooldownSeconds > 0 ? "text-warning animate-pulse" : "text-success"
            )}>
              {cooldownSeconds > 0 ? formatCooldown(cooldownSeconds) : "Ready"}
            </span>
          </div>

          {/* Manual Override */}
          <div className="space-y-1">
            <p className="metric-label flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              Override
            </p>
            <Badge 
              variant={manualOverrideActive ? "warning" : "outline"} 
              className="text-xs"
            >
              {manualOverrideActive ? "Active" : "Off"}
            </Badge>
          </div>

          {/* Trust Score */}
          <div className="space-y-1">
            <p className="metric-label">Trust Score</p>
            <div className="flex items-center gap-2">
              <span className={cn(
                "metric-value text-lg",
                trustScore >= 80 ? "text-success" : 
                trustScore >= 50 ? "text-warning" : "text-danger"
              )}>
                {trustScore}
              </span>
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className={cn(
                      "h-2 w-2 rounded-full",
                      i < Math.ceil(trustScore / 20)
                        ? "bg-primary"
                        : "bg-muted"
                    )}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Risk Mode */}
          <div className="space-y-1">
            <p className="metric-label">Risk Mode</p>
            <Badge variant={lockedRiskMode ? "locked" : "healthy"}>
              {lockedRiskMode ? "Locked" : "Active"}
            </Badge>
          </div>
        </div>
      </div>
    </div>
  );
}
