import { TrendingUp, TrendingDown, DollarSign, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PnLSummary } from "@/hooks/usePnLSummary";

interface PnLSummaryCardProps {
  summary: PnLSummary;
}

function fmt(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2 }).format(n);
}

export function PnLSummaryCard({ summary }: PnLSummaryCardProps) {
  const isUp = summary.totalPnl >= 0;
  const isTodayUp = summary.todayPnl >= 0;

  return (
    <div className="glass-card p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Wallet className="h-5 w-5 text-primary" />
          <span className="font-semibold text-sm">Account Overview</span>
        </div>
        <div className={cn(
          "flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
          isUp ? "bg-success/15 text-success" : "bg-destructive/15 text-destructive"
        )}>
          {isUp ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
          {isUp ? "+" : ""}{summary.pnlPct.toFixed(2)}%
        </div>
      </div>

      {/* Balance row */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-xs text-muted-foreground mb-0.5">Starting Balance</p>
          <p className="text-lg font-mono font-bold text-foreground">{fmt(summary.startingBalance)}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground mb-0.5">Current Balance</p>
          <p className={cn("text-lg font-mono font-bold", isUp ? "text-success" : "text-destructive")}>
            {fmt(summary.currentBalance)}
          </p>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-4 gap-2 border-t border-border/40 pt-3">
        <div className="text-center">
          <p className="text-xs text-muted-foreground">Total P&L</p>
          <p className={cn("text-sm font-mono font-semibold mt-0.5", isUp ? "text-success" : "text-destructive")}>
            {isUp ? "+" : ""}{fmt(summary.totalPnl)}
          </p>
        </div>
        <div className="text-center">
          <p className="text-xs text-muted-foreground">Today</p>
          <p className={cn("text-sm font-mono font-semibold mt-0.5", isTodayUp ? "text-success" : summary.todayPnl < 0 ? "text-destructive" : "text-muted-foreground")}>
            {isTodayUp && summary.todayPnl > 0 ? "+" : ""}{fmt(summary.todayPnl)}
          </p>
        </div>
        <div className="text-center">
          <p className="text-xs text-muted-foreground">Total R</p>
          <p className={cn("text-sm font-mono font-semibold mt-0.5", summary.totalR >= 0 ? "text-success" : "text-destructive")}>
            {summary.totalR >= 0 ? "+" : ""}{summary.totalR.toFixed(1)}R
          </p>
        </div>
        <div className="text-center">
          <p className="text-xs text-muted-foreground">W / L Days</p>
          <p className="text-sm font-mono font-semibold mt-0.5">
            <span className="text-success">{summary.winDays}</span>
            <span className="text-muted-foreground">/</span>
            <span className="text-destructive">{summary.lossDays}</span>
          </p>
        </div>
      </div>
    </div>
  );
}
