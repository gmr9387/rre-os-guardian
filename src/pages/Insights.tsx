import { 
  Fingerprint, 
  TrendingUp, 
  Clock, 
  Target, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Zap
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface InsightData {
  alphaFingerprint: {
    strengths: string[];
    weaknesses: string[];
  };
  bestSymbols: { symbol: string; winrate: number; trades: number }[];
  bestSessions: { session: string; winrate: number }[];
  bestCandidateTypes: { type: string; avgR: number }[];
  rrBandStats: { band: string; winrate: number }[];
  avoidConditions: string[];
  confidenceLevels: { level: string; accuracy: number }[];
}

const mockInsights: InsightData = {
  alphaFingerprint: {
    strengths: [
      "Strong at London session reclaims",
      "Excellent risk management on gold",
      "Quick decision-making under pressure",
      "High accuracy on 1.5-2.0 RR setups",
    ],
    weaknesses: [
      "Tendency to overtrade after losses",
      "Lower accuracy during news events",
      "Weak at ladder entries",
      "Reduced performance in Asian session",
    ],
  },
  bestSymbols: [
    { symbol: "EURUSD", winrate: 68, trades: 45 },
    { symbol: "XAUUSD", winrate: 62, trades: 32 },
    { symbol: "NAS100", winrate: 58, trades: 28 },
    { symbol: "GBPUSD", winrate: 55, trades: 25 },
  ],
  bestSessions: [
    { session: "London", winrate: 72 },
    { session: "NY Open", winrate: 65 },
    { session: "London/NY Overlap", winrate: 60 },
    { session: "Asian", winrate: 48 },
  ],
  bestCandidateTypes: [
    { type: "Reclaim", avgR: 1.6 },
    { type: "Retest", avgR: 1.2 },
    { type: "Ladder", avgR: 0.8 },
  ],
  rrBandStats: [
    { band: "1.0-1.5", winrate: 72 },
    { band: "1.5-2.0", winrate: 68 },
    { band: "2.0-2.5", winrate: 55 },
    { band: "2.5+", winrate: 45 },
  ],
  avoidConditions: [
    "High EVI (>60)",
    "Pre-news (15 min)",
    "Loss streak ≥3",
    "Low liquidity (late Friday)",
  ],
  confidenceLevels: [
    { level: "High (80%+)", accuracy: 78 },
    { level: "Medium (60-79%)", accuracy: 62 },
    { level: "Low (<60%)", accuracy: 45 },
  ],
};

export default function Insights() {
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
            {mockInsights.alphaFingerprint.strengths.map((strength, idx) => (
              <li key={idx} className="flex items-start gap-2 text-sm">
                <Zap className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                {strength}
              </li>
            ))}
          </ul>
        </div>

        {/* Weaknesses */}
        <div className="glass-card p-4">
          <h3 className="mb-3 flex items-center gap-2 font-medium text-warning">
            <AlertTriangle className="h-5 w-5" />
            Areas for Improvement
          </h3>
          <ul className="space-y-2">
            {mockInsights.alphaFingerprint.weaknesses.map((weakness, idx) => (
              <li key={idx} className="flex items-start gap-2 text-sm">
                <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
                {weakness}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Best Symbols */}
      <div className="glass-card p-4">
        <h3 className="mb-3 flex items-center gap-2 font-medium">
          <TrendingUp className="h-5 w-5 text-primary" />
          Best Performing Symbols
        </h3>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {mockInsights.bestSymbols.map((item) => (
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
      </div>

      {/* Best Sessions */}
      <div className="glass-card p-4">
        <h3 className="mb-3 flex items-center gap-2 font-medium">
          <Clock className="h-5 w-5 text-primary" />
          Session Performance
        </h3>
        <div className="space-y-3">
          {mockInsights.bestSessions.map((session) => (
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
      </div>

      {/* RR Band Stats & Candidate Types */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Candidate Types */}
        <div className="glass-card p-4">
          <h3 className="mb-3 flex items-center gap-2 font-medium">
            <Target className="h-5 w-5 text-primary" />
            Candidate Type Performance
          </h3>
          <div className="space-y-3">
            {mockInsights.bestCandidateTypes.map((item) => (
              <div key={item.type} className="flex items-center justify-between rounded-lg border border-border/50 bg-muted/30 p-3">
                <Badge variant={item.type.toLowerCase() as any}>{item.type}</Badge>
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
        </div>

        {/* RR Band Stats */}
        <div className="glass-card p-4">
          <h3 className="mb-3 font-medium">RR Band Performance</h3>
          <div className="space-y-3">
            {mockInsights.rrBandStats.map((band) => (
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
        </div>
      </div>

      {/* Avoid Conditions */}
      <div className="glass-card border-danger/30 bg-danger/5 p-4">
        <h3 className="mb-3 flex items-center gap-2 font-medium text-danger">
          <AlertTriangle className="h-5 w-5" />
          Conditions to Avoid
        </h3>
        <div className="flex flex-wrap gap-2">
          {mockInsights.avoidConditions.map((condition, idx) => (
            <Badge key={idx} variant="locked" className="text-sm">
              {condition}
            </Badge>
          ))}
        </div>
      </div>

      {/* Confidence Accuracy */}
      <div className="glass-card p-4">
        <h3 className="mb-3 font-medium">Confidence Level Accuracy</h3>
        <p className="mb-4 text-sm text-muted-foreground">
          How accurate your confidence predictions have been historically
        </p>
        <div className="grid grid-cols-3 gap-3">
          {mockInsights.confidenceLevels.map((level) => (
            <div key={level.level} className="rounded-lg border border-border/50 bg-muted/30 p-3 text-center">
              <p className="text-xs text-muted-foreground">{level.level}</p>
              <span className={cn(
                "metric-value text-lg",
                level.accuracy >= 70 ? "text-success" :
                level.accuracy >= 55 ? "text-primary" : "text-warning"
              )}>
                {level.accuracy}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
