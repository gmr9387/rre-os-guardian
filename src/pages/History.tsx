import { useState } from "react";
import { 
  Calendar, 
  Filter, 
  TrendingUp, 
  TrendingDown,
  Search,
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface HistoryEntry {
  id: string;
  symbol: string;
  side: "BUY" | "SELL";
  type: "reclaim" | "retest" | "ladder";
  score: number;
  rr: number;
  confidence: number;
  outcome: "win" | "loss" | "be";
  realizedR: number;
  date: Date;
  account: string;
}

const mockHistory: HistoryEntry[] = [
  {
    id: "h-1",
    symbol: "EURUSD",
    side: "SELL",
    type: "reclaim",
    score: 85,
    rr: 2.0,
    confidence: 78,
    outcome: "win",
    realizedR: 1.8,
    date: new Date(),
    account: "FTMO Challenge",
  },
  {
    id: "h-2",
    symbol: "GBPUSD",
    side: "BUY",
    type: "retest",
    score: 72,
    rr: 1.5,
    confidence: 65,
    outcome: "loss",
    realizedR: -1.0,
    date: new Date(Date.now() - 86400000),
    account: "FTMO Challenge",
  },
  {
    id: "h-3",
    symbol: "XAUUSD",
    side: "SELL",
    type: "ladder",
    score: 68,
    rr: 2.5,
    confidence: 55,
    outcome: "win",
    realizedR: 2.2,
    date: new Date(Date.now() - 172800000),
    account: "Personal Live",
  },
  {
    id: "h-4",
    symbol: "NAS100",
    side: "BUY",
    type: "reclaim",
    score: 90,
    rr: 1.8,
    confidence: 82,
    outcome: "be",
    realizedR: 0,
    date: new Date(Date.now() - 259200000),
    account: "FTMO Challenge",
  },
];

export default function History() {
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [outcomeFilter, setOutcomeFilter] = useState<string>("all");

  const filteredHistory = mockHistory.filter((entry) => {
    const matchesSearch = entry.symbol.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === "all" || entry.type === typeFilter;
    const matchesOutcome = outcomeFilter === "all" || entry.outcome === outcomeFilter;
    return matchesSearch && matchesType && matchesOutcome;
  });

  const getOutcomeConfig = (outcome: HistoryEntry["outcome"]) => {
    switch (outcome) {
      case "win":
        return { label: "Win", color: "text-success", bg: "bg-success/20" };
      case "loss":
        return { label: "Loss", color: "text-danger", bg: "bg-danger/20" };
      case "be":
        return { label: "B/E", color: "text-muted-foreground", bg: "bg-muted" };
    }
  };

  return (
    <div className="space-y-4 pb-20 lg:pb-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold">Trade History</h1>
          <p className="text-sm text-muted-foreground">
            {filteredHistory.length} re-entries recorded
          </p>
        </div>
        <Button variant="outline" size="sm" className="gap-2">
          <Calendar className="h-4 w-4" />
          Date Range
        </Button>
      </div>

      {/* Filters */}
      <div className="glass-card p-4">
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search symbol..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-full sm:w-[140px]">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="reclaim">Reclaim</SelectItem>
              <SelectItem value="retest">Retest</SelectItem>
              <SelectItem value="ladder">Ladder</SelectItem>
            </SelectContent>
          </Select>
          <Select value={outcomeFilter} onValueChange={setOutcomeFilter}>
            <SelectTrigger className="w-full sm:w-[140px]">
              <SelectValue placeholder="Outcome" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Outcomes</SelectItem>
              <SelectItem value="win">Wins</SelectItem>
              <SelectItem value="loss">Losses</SelectItem>
              <SelectItem value="be">Break Even</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* History List */}
      <div className="space-y-2">
        {filteredHistory.map((entry) => {
          const outcomeConfig = getOutcomeConfig(entry.outcome);
          return (
            <div
              key={entry.id}
              className="glass-card flex items-center gap-4 p-4 transition-colors hover:bg-accent/50"
            >
              {/* Symbol & Direction */}
              <div className="flex items-center gap-3">
                <div className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-lg",
                  entry.side === "BUY" ? "bg-success/20" : "bg-danger/20"
                )}>
                  {entry.side === "BUY" ? (
                    <TrendingUp className="h-5 w-5 text-success" />
                  ) : (
                    <TrendingDown className="h-5 w-5 text-danger" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-medium">{entry.symbol}</span>
                    <Badge variant={entry.type} className="text-[10px]">
                      {entry.type}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {entry.date.toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Metrics */}
              <div className="hidden flex-1 grid-cols-4 gap-4 sm:grid">
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">Score</p>
                  <span className="font-mono font-medium">{entry.score}</span>
                </div>
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">RR</p>
                  <span className="font-mono font-medium">{entry.rr.toFixed(1)}</span>
                </div>
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">Confidence</p>
                  <span className="font-mono font-medium">{entry.confidence}%</span>
                </div>
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">Realized R</p>
                  <span className={cn(
                    "font-mono font-medium",
                    entry.realizedR > 0 ? "text-success" : entry.realizedR < 0 ? "text-danger" : "text-muted-foreground"
                  )}>
                    {entry.realizedR > 0 ? "+" : ""}{entry.realizedR.toFixed(1)}R
                  </span>
                </div>
              </div>

              {/* Outcome */}
              <div className={cn(
                "flex h-8 items-center rounded-full px-3",
                outcomeConfig.bg
              )}>
                <span className={cn("text-sm font-medium", outcomeConfig.color)}>
                  {outcomeConfig.label}
                </span>
              </div>

              {/* Arrow */}
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </div>
          );
        })}
      </div>

      {filteredHistory.length === 0 && (
        <div className="glass-card flex flex-col items-center justify-center py-12 text-center">
          <Filter className="h-12 w-12 text-muted-foreground/50" />
          <h3 className="mt-4 font-medium">No trades found</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Adjust your filters or search query
          </p>
        </div>
      )}
    </div>
  );
}
