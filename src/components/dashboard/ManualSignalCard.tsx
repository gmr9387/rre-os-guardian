import { useState } from "react";
import { 
  Copy, 
  Check, 
  AlertTriangle, 
  Target,
  TrendingUp,
  Shield,
  Info,
  ChevronDown,
  ChevronUp,
  Sparkles,
  ExternalLink
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { 
  getCandidateTypeLabel, 
  getScoreInterpretation, 
  getRRInterpretation,
  getConfidenceLevel 
} from "@/lib/candidateEngine";

interface Candidate {
  id: string;
  type: "reclaim" | "retest" | "ladder";
  entryPrice: number;
  slPrice: number;
  tpPrice: number;
  rrRatio: number;
  setupScore: number;
  personalConfidence: number;
  trustContext: string;
  riskFlags: string[];
  strategyTag: string;
  symbol: string;
  side: "BUY" | "SELL";
  rules: string[];
  status?: string;
}

interface ManualSignalCardProps {
  candidate: Candidate;
  rank: number;
  onMarkExecuted: (id: string) => void;
  onIgnore: (id: string) => void;
  onClick?: (id: string) => void;
}

export function ManualSignalCard({ 
  candidate, 
  rank, 
  onMarkExecuted,
  onIgnore,
  onClick 
}: ManualSignalCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const {
    type,
    entryPrice,
    slPrice,
    tpPrice,
    rrRatio,
    setupScore,
    personalConfidence,
    trustContext,
    riskFlags,
    strategyTag,
    symbol,
    side,
    rules
  } = candidate;

  const copyToClipboard = async (value: string, field: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedField(field);
      toast.success(`${field} copied to clipboard`);
      setTimeout(() => setCopiedField(null), 2000);
    } catch {
      toast.error("Failed to copy");
    }
  };

  const copyAllSignals = async () => {
    const signalText = `${symbol} ${side}
Entry: ${entryPrice.toFixed(5)}
SL: ${slPrice.toFixed(5)}
TP: ${tpPrice.toFixed(5)}
RR: ${rrRatio.toFixed(1)}:1`;
    
    try {
      await navigator.clipboard.writeText(signalText);
      setCopiedField("all");
      toast.success("All signals copied to clipboard");
      setTimeout(() => setCopiedField(null), 2000);
    } catch {
      toast.error("Failed to copy");
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-success";
    if (score >= 60) return "text-primary";
    if (score >= 40) return "text-warning";
    return "text-danger";
  };

  return (
    <div 
      className={cn(
        "glass-card-elevated overflow-hidden transition-all duration-300 animate-slide-up",
        rank === 1 && "ring-1 ring-primary/30"
      )}
      style={{ animationDelay: `${300 + rank * 100}ms` }}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border/50 px-4 py-3">
        <div className="flex items-center gap-3">
          <div className={cn(
            "flex h-8 w-8 items-center justify-center rounded-lg font-mono font-bold",
            rank === 1 ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
          )}>
            #{rank}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <Badge variant={type}>{getCandidateTypeLabel(type as "reclaim" | "retest" | "ladder")}</Badge>
              <span className="font-mono text-sm font-medium">{symbol}</span>
              <Badge variant={side === "BUY" ? "buy" : "sell"} className="text-[10px]">
                {side}
              </Badge>
            </div>
            <div className="mt-0.5 flex items-center gap-2">
              <Badge variant="outline" className="text-[10px]">{strategyTag}</Badge>
              <span className="text-xs text-muted-foreground">{trustContext}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="gap-1 text-xs bg-accent/50">
            <ExternalLink className="h-3 w-3" />
            Manual
          </Badge>
          {riskFlags.length > 0 && (
            <div className="flex items-center gap-1">
              {riskFlags.slice(0, 2).map((flag, idx) => (
                <AlertTriangle key={idx} className="h-4 w-4 text-warning" />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Copy-able Trade Signals */}
      <div className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-muted-foreground">Trade Signals</span>
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 h-7"
            onClick={copyAllSignals}
          >
            {copiedField === "all" ? (
              <Check className="h-3 w-3 text-success" />
            ) : (
              <Copy className="h-3 w-3" />
            )}
            Copy All
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {/* Entry Price */}
          <button
            onClick={() => copyToClipboard(entryPrice.toFixed(5), "Entry")}
            className={cn(
              "flex items-center justify-between rounded-lg border-2 p-3 transition-all hover:border-primary/50",
              copiedField === "Entry" ? "border-success bg-success/10" : "border-border bg-muted/30"
            )}
          >
            <div className="text-left">
              <p className="text-xs text-muted-foreground">Entry</p>
              <span className="font-mono font-semibold text-foreground">{entryPrice.toFixed(5)}</span>
            </div>
            {copiedField === "Entry" ? (
              <Check className="h-4 w-4 text-success" />
            ) : (
              <Copy className="h-4 w-4 text-muted-foreground" />
            )}
          </button>

          {/* Stop Loss */}
          <button
            onClick={() => copyToClipboard(slPrice.toFixed(5), "SL")}
            className={cn(
              "flex items-center justify-between rounded-lg border-2 p-3 transition-all hover:border-danger/50",
              copiedField === "SL" ? "border-success bg-success/10" : "border-border bg-muted/30"
            )}
          >
            <div className="text-left">
              <p className="text-xs text-muted-foreground">Stop Loss</p>
              <span className="font-mono font-semibold text-danger">{slPrice.toFixed(5)}</span>
            </div>
            {copiedField === "SL" ? (
              <Check className="h-4 w-4 text-success" />
            ) : (
              <Copy className="h-4 w-4 text-muted-foreground" />
            )}
          </button>

          {/* Take Profit */}
          <button
            onClick={() => copyToClipboard(tpPrice.toFixed(5), "TP")}
            className={cn(
              "flex items-center justify-between rounded-lg border-2 p-3 transition-all hover:border-success/50",
              copiedField === "TP" ? "border-success bg-success/10" : "border-border bg-muted/30"
            )}
          >
            <div className="text-left">
              <p className="text-xs text-muted-foreground">Take Profit</p>
              <span className="font-mono font-semibold text-success">{tpPrice.toFixed(5)}</span>
            </div>
            {copiedField === "TP" ? (
              <Check className="h-4 w-4 text-success" />
            ) : (
              <Copy className="h-4 w-4 text-muted-foreground" />
            )}
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-3 gap-4 px-4 pb-4">
        <div className="space-y-1">
          <p className="metric-label flex items-center gap-1">
            <Target className="h-3 w-3" />
            RR
          </p>
          <span className={cn("metric-value text-sm", getRRInterpretation(rrRatio).color)}>
            {rrRatio.toFixed(1)}:1
          </span>
        </div>
        <div className="space-y-1">
          <p className="metric-label flex items-center gap-1">
            <Sparkles className="h-3 w-3" />
            Score
          </p>
          <span className={cn("metric-value text-sm", getScoreInterpretation(setupScore).color)}>
            {setupScore}
          </span>
        </div>
        <div className="space-y-1">
          <p className="metric-label flex items-center gap-1">
            <Shield className="h-3 w-3" />
            Confidence
          </p>
          <span className={cn("metric-value text-sm flex items-center gap-1", getScoreColor(personalConfidence))}>
            {getConfidenceLevel(personalConfidence).emoji} {personalConfidence}%
          </span>
        </div>
      </div>

      {/* Expandable Rules */}
      <div className="border-t border-border/50">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex w-full items-center justify-between px-4 py-2 text-sm text-muted-foreground hover:bg-accent/50 transition-colors"
        >
          <span className="flex items-center gap-2">
            <Info className="h-4 w-4" />
            Why this re-entry?
          </span>
          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
        {isExpanded && (
          <div className="border-t border-border/30 bg-muted/30 px-4 py-3 animate-fade-in">
            <ul className="space-y-1 text-sm text-muted-foreground">
              {rules.map((rule, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <Check className="mt-0.5 h-3 w-3 text-success shrink-0" />
                  {rule}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="border-t border-border/50 p-4">
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button
            variant="execute"
            className="flex-1 gap-2"
            onClick={() => onMarkExecuted(candidate.id)}
          >
            <Check className="h-4 w-4" />
            Mark as Executed
          </Button>
          <Button
            variant="ghost"
            className="flex-1 sm:flex-none text-muted-foreground"
            onClick={() => onIgnore(candidate.id)}
          >
            Ignore
          </Button>
        </div>
        <p className="mt-2 text-xs text-center text-muted-foreground">
          Execute this trade manually in your preferred broker
        </p>
      </div>
    </div>
  );
}
