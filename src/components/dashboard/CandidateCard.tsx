import { useState, useRef, useEffect } from "react";
import { 
  ChevronDown, 
  ChevronUp, 
  AlertTriangle, 
  Zap,
  Target,
  TrendingUp,
  Shield,
  Info,
  Check,
  X,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

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

interface CandidateCardProps {
  candidate: Candidate;
  rank: number;
  onExecute: (id: string) => Promise<void>;
  onAdjust: (id: string) => void;
  onIgnore: (id: string) => void;
  onClick?: (id: string) => void;
}

type ExecutionStatus = "idle" | "holding" | "sending" | "executed" | "rejected" | "failed";

export function CandidateCard({ 
  candidate, 
  rank, 
  onExecute, 
  onAdjust, 
  onIgnore,
  onClick 
}: CandidateCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [executionStatus, setExecutionStatus] = useState<ExecutionStatus>("idle");
  const [holdProgress, setHoldProgress] = useState(0);
  const holdTimerRef = useRef<NodeJS.Timeout | null>(null);
  const progressRef = useRef<NodeJS.Timeout | null>(null);

  const HOLD_DURATION = 1200; // 1.2 seconds

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

  const handlePointerDown = () => {
    if (executionStatus !== "idle") return;
    
    setExecutionStatus("holding");
    setHoldProgress(0);

    const startTime = Date.now();
    progressRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min((elapsed / HOLD_DURATION) * 100, 100);
      setHoldProgress(progress);
    }, 16);

    holdTimerRef.current = setTimeout(async () => {
      clearInterval(progressRef.current!);
      setHoldProgress(100);
      setExecutionStatus("sending");
      
      try {
        await onExecute(candidate.id);
        setExecutionStatus("executed");
      } catch (error) {
        setExecutionStatus("failed");
      }
    }, HOLD_DURATION);
  };

  const handlePointerUp = () => {
    if (executionStatus === "holding") {
      clearTimeout(holdTimerRef.current!);
      clearInterval(progressRef.current!);
      setHoldProgress(0);
      setExecutionStatus("idle");
    }
  };

  useEffect(() => {
    return () => {
      if (holdTimerRef.current) clearTimeout(holdTimerRef.current);
      if (progressRef.current) clearInterval(progressRef.current);
    };
  }, []);

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-success";
    if (score >= 60) return "text-primary";
    if (score >= 40) return "text-warning";
    return "text-danger";
  };

  const getExecutionButtonContent = () => {
    switch (executionStatus) {
      case "holding":
        return (
          <div className="relative flex items-center justify-center">
            <span>HOLD TO RE-ENTER</span>
          </div>
        );
      case "sending":
        return (
          <div className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Sending...</span>
          </div>
        );
      case "executed":
        return (
          <div className="flex items-center gap-2">
            <Check className="h-4 w-4" />
            <span>Confirmed</span>
          </div>
        );
      case "rejected":
        return (
          <div className="flex items-center gap-2">
            <X className="h-4 w-4" />
            <span>Rejected</span>
          </div>
        );
      case "failed":
        return (
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            <span>Failed</span>
          </div>
        );
      default:
        return (
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            <span>PRESS & HOLD TO RE-ENTER</span>
          </div>
        );
    }
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
              <Badge variant={type}>{type.toUpperCase()}</Badge>
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
          {riskFlags.length > 0 && (
            <div className="flex items-center gap-1">
              {riskFlags.slice(0, 2).map((flag, idx) => (
                <AlertTriangle key={idx} className="h-4 w-4 text-warning" />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-3 gap-4 p-4 sm:grid-cols-6">
        <div className="space-y-1">
          <p className="metric-label">Entry</p>
          <span className="metric-value text-sm">{entryPrice.toFixed(5)}</span>
        </div>
        <div className="space-y-1">
          <p className="metric-label">SL</p>
          <span className="metric-value text-sm text-danger">{slPrice.toFixed(5)}</span>
        </div>
        <div className="space-y-1">
          <p className="metric-label">TP</p>
          <span className="metric-value text-sm text-success">{tpPrice.toFixed(5)}</span>
        </div>
        <div className="space-y-1">
          <p className="metric-label flex items-center gap-1">
            <Target className="h-3 w-3" />
            RR
          </p>
          <span className={cn("metric-value text-sm", getScoreColor(rrRatio * 25))}>
            {rrRatio.toFixed(1)}
          </span>
        </div>
        <div className="space-y-1">
          <p className="metric-label flex items-center gap-1">
            <TrendingUp className="h-3 w-3" />
            Score
          </p>
          <span className={cn("metric-value text-sm", getScoreColor(setupScore))}>
            {setupScore}
          </span>
        </div>
        <div className="space-y-1">
          <p className="metric-label flex items-center gap-1">
            <Shield className="h-3 w-3" />
            Confidence
          </p>
          <span className={cn("metric-value text-sm", getScoreColor(personalConfidence))}>
            {personalConfidence}%
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
          {/* Execute Button */}
          <Button
            variant="execute"
            className={cn(
              "relative flex-1 overflow-hidden transition-all",
              executionStatus === "executed" && "bg-success",
              executionStatus === "failed" && "bg-danger"
            )}
            onPointerDown={handlePointerDown}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
            disabled={executionStatus !== "idle" && executionStatus !== "holding"}
          >
            {/* Progress bar */}
            {executionStatus === "holding" && (
              <div 
                className="absolute inset-0 bg-primary-foreground/20 transition-transform origin-left"
                style={{ transform: `scaleX(${holdProgress / 100})` }}
              />
            )}
            <span className="relative z-10">
              {getExecutionButtonContent()}
            </span>
          </Button>

          {/* Secondary Actions */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1 sm:flex-none"
              onClick={() => onAdjust(candidate.id)}
            >
              Adjust
            </Button>
            <Button
              variant="ghost"
              className="flex-1 sm:flex-none text-muted-foreground"
              onClick={() => onIgnore(candidate.id)}
            >
              Ignore
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
