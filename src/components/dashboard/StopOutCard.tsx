import { TrendingUp, TrendingDown, Clock, DollarSign } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { modeToVariant } from "@/lib/badgeMaps";
import { cn } from "@/lib/utils";

interface StopOutEvent {
  id: string;
  symbol: string;
  side: "BUY" | "SELL";
  entryPrice: number;
  stopPrice: number;
  lots: number;
  occurredAt: Date;
  session: string;
  mode: "live" | "test" | "train";
}

interface StopOutCardProps {
  event: StopOutEvent;
  recentEvents?: StopOutEvent[];
}

export function StopOutCard({ event, recentEvents = [] }: StopOutCardProps) {
  const { symbol, side, entryPrice, stopPrice, lots, occurredAt, session, mode } = event;
  
  const isBuy = side === "BUY";
  const priceDiff = isBuy ? stopPrice - entryPrice : entryPrice - stopPrice;
  const formattedTime = new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  }).format(occurredAt);

  return (
    <div className="glass-card-elevated overflow-hidden animate-slide-up" style={{ animationDelay: '200ms' }}>
      {/* Header with gradient accent */}
      <div className={cn(
        "relative px-4 py-3",
        isBuy ? "bg-success/10" : "bg-danger/10"
      )}>
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-background/50" />
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={cn(
              "flex h-10 w-10 items-center justify-center rounded-lg",
              isBuy ? "bg-success/20" : "bg-danger/20"
            )}>
              {isBuy ? (
                <TrendingUp className="h-5 w-5 text-success" />
              ) : (
                <TrendingDown className="h-5 w-5 text-danger" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-lg font-bold">{symbol}</span>
                <Badge variant={isBuy ? "buy" : "sell"}>{side}</Badge>
              </div>
              <p className="text-xs text-muted-foreground">Latest Stop-Out</p>
            </div>
          </div>
          <Badge variant={modeToVariant(mode)}>{mode.toUpperCase()}</Badge>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {/* Entry Price */}
          <div className="space-y-1">
            <p className="metric-label">Entry</p>
            <span className="metric-value text-base">{entryPrice.toFixed(symbol.includes('JPY') ? 3 : 5)}</span>
          </div>

          {/* Stop Price */}
          <div className="space-y-1">
            <p className="metric-label">Stop</p>
            <span className="metric-value text-base text-danger">{stopPrice.toFixed(symbol.includes('JPY') ? 3 : 5)}</span>
          </div>

          {/* Lots */}
          <div className="space-y-1">
            <p className="metric-label flex items-center gap-1">
              <DollarSign className="h-3 w-3" />
              Lots
            </p>
            <span className="metric-value text-base">{lots.toFixed(2)}</span>
          </div>

          {/* Session */}
          <div className="space-y-1">
            <p className="metric-label flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Session
            </p>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">{session}</span>
              <span className="text-xs text-muted-foreground">{formattedTime}</span>
            </div>
          </div>
        </div>

        {/* Mini Timeline */}
        {recentEvents.length > 0 && (
          <div className="mt-4 border-t border-border/50 pt-4">
            <p className="mb-2 text-xs text-muted-foreground">Recent Stop-Outs</p>
            <div className="flex gap-2">
              {recentEvents.slice(0, 3).map((evt, idx) => (
                <div 
                  key={evt.id}
                  className={cn(
                    "flex-1 rounded-md border p-2 text-center transition-colors hover:bg-accent/50",
                    evt.side === "BUY" ? "border-success/30 bg-success/5" : "border-danger/30 bg-danger/5"
                  )}
                >
                  <p className="font-mono text-xs font-medium">{evt.symbol}</p>
                  <Badge 
                    variant={evt.side === "BUY" ? "buy" : "sell"} 
                    className="mt-1 text-[10px]"
                  >
                    {evt.side}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
