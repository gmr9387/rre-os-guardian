import { HealthBanner } from "@/components/dashboard/HealthBanner";
import { RiskSnapshot } from "@/components/dashboard/RiskSnapshot";
import { StopOutCard } from "@/components/dashboard/StopOutCard";
import { CandidateCard } from "@/components/dashboard/CandidateCard";
import { toast } from "sonner";

// Mock data
const mockHealthMetrics = {
  dailyPnl: -0.45,
  realizedR: -1.2,
  lossStreak: 2,
  maxDrawdown: 2.3,
  evi: 35,
  status: "elevated" as const,
};

const mockRiskMetrics = {
  reentriesUsed: 2,
  maxReentries: 5,
  cooldownSeconds: 0,
  manualOverrideActive: false,
  trustScore: 72,
  lockedRiskMode: false,
};

const mockStopOut = {
  id: "so-1",
  symbol: "EURUSD",
  side: "SELL" as const,
  entryPrice: 1.08542,
  stopPrice: 1.08742,
  lots: 0.25,
  occurredAt: new Date(),
  session: "London",
  mode: "live" as const,
};

const mockRecentStopOuts = [
  { ...mockStopOut, id: "so-2", symbol: "GBPUSD", side: "BUY" as const },
  { ...mockStopOut, id: "so-3", symbol: "XAUUSD", side: "SELL" as const },
];

const mockCandidates = [
  {
    id: "c-1",
    type: "reclaim" as const,
    entryPrice: 1.08642,
    slPrice: 1.08442,
    tpPrice: 1.09042,
    rrRatio: 2.0,
    setupScore: 85,
    personalConfidence: 78,
    trustContext: "High win session",
    riskFlags: [],
    strategyTag: "London Reclaim",
    symbol: "EURUSD",
    side: "SELL" as const,
    rules: [
      "Price rejected from prior session high",
      "Momentum aligned with higher timeframe trend",
      "Clean liquidity sweep above resistance",
      "Volume confirmation on rejection candle",
    ],
  },
  {
    id: "c-2",
    type: "retest" as const,
    entryPrice: 1.08592,
    slPrice: 1.08392,
    tpPrice: 1.08892,
    rrRatio: 1.5,
    setupScore: 72,
    personalConfidence: 65,
    trustContext: "Moderate setup",
    riskFlags: ["EVI elevated"],
    strategyTag: "Structure Retest",
    symbol: "EURUSD",
    side: "SELL" as const,
    rules: [
      "Key level retest after break",
      "Lower timeframe bullish rejection",
      "Session overlap transition",
    ],
  },
  {
    id: "c-3",
    type: "ladder" as const,
    entryPrice: 1.08492,
    slPrice: 1.08292,
    tpPrice: 1.08892,
    rrRatio: 2.0,
    setupScore: 68,
    personalConfidence: 55,
    trustContext: "Extended target",
    riskFlags: ["High volatility", "News pending"],
    strategyTag: "Ladder Scale",
    symbol: "EURUSD",
    side: "SELL" as const,
    rules: [
      "Multiple entry ladder strategy",
      "Average entry optimization",
    ],
  },
];

export default function Dashboard() {
  const handleExecute = async (id: string) => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    toast.success("Re-entry executed successfully", {
      description: `Order placed for candidate ${id}`,
    });
  };

  const handleAdjust = (id: string) => {
    toast.info("Opening adjustment panel", {
      description: `Adjusting candidate ${id}`,
    });
  };

  const handleIgnore = (id: string) => {
    toast.warning("Candidate ignored", {
      description: `Candidate ${id} marked as ignored`,
    });
  };

  return (
    <div className="space-y-4 pb-20 lg:pb-6">
      {/* Page Title - Mobile */}
      <div className="lg:hidden">
        <h1 className="text-xl font-bold">Re-Entry HUD</h1>
        <p className="text-sm text-muted-foreground">Real-time trading intelligence</p>
      </div>

      {/* Health Banner */}
      <HealthBanner metrics={mockHealthMetrics} />

      {/* Risk Snapshot */}
      <RiskSnapshot metrics={mockRiskMetrics} />

      {/* Stop-Out Card */}
      <StopOutCard event={mockStopOut} recentEvents={mockRecentStopOuts} />

      {/* Candidate Stack */}
      <div className="space-y-3">
        <h2 className="flex items-center gap-2 text-lg font-semibold">
          <span className="text-primary">#</span>
          Re-Entry Candidates
          <span className="rounded-full bg-primary/20 px-2 py-0.5 text-xs font-medium text-primary">
            {mockCandidates.length}
          </span>
        </h2>
        <div className="space-y-3">
          {mockCandidates.map((candidate, index) => (
            <CandidateCard
              key={candidate.id}
              candidate={candidate}
              rank={index + 1}
              onExecute={handleExecute}
              onAdjust={handleAdjust}
              onIgnore={handleIgnore}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
