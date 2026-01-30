import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { HealthBanner } from "@/components/dashboard/HealthBanner";
import { RiskSnapshot } from "@/components/dashboard/RiskSnapshot";
import { StopOutCard } from "@/components/dashboard/StopOutCard";
import { CandidateCard } from "@/components/dashboard/CandidateCard";
import { TestStopoutButton } from "@/components/dashboard/TestStopoutButton";
import { AdjustCandidateModal } from "@/components/dashboard/AdjustCandidateModal";
import { Skeleton } from "@/components/ui/skeleton";
import { useActiveAccount } from "@/hooks/useActiveAccount";
import { 
  useDailyMetrics, 
  useBehaviorMetrics, 
  useLatestStopout, 
  useRecentStopouts,
  usePendingCandidates 
} from "@/hooks/useDashboardData";
import { useCandidateActions } from "@/hooks/useCandidateActions";
import { useRealtimeSubscription } from "@/hooks/useRealtimeSubscription";
import { AlertCircle } from "lucide-react";

export default function Dashboard() {
  const navigate = useNavigate();
  const { activeAccount, accountSettings, loading: accountLoading } = useActiveAccount();
  const { data: dailyMetrics, isLoading: metricsLoading } = useDailyMetrics();
  const { data: behaviorMetrics, isLoading: behaviorLoading } = useBehaviorMetrics();
  const { data: latestStopout, isLoading: stopoutLoading } = useLatestStopout();
  const { data: recentStopouts, isLoading: recentLoading } = useRecentStopouts(3);
  const { data: candidates, isLoading: candidatesLoading } = usePendingCandidates();
  const { execute, ignore, adjust } = useCandidateActions();
  
  // Enable real-time updates
  useRealtimeSubscription();

  const [adjustModalOpen, setAdjustModalOpen] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<{
    id: string;
    entryPrice: number;
    slPrice: number;
    tpPrice: number;
    symbol: string;
  } | null>(null);

  const isLoading = accountLoading || metricsLoading || behaviorLoading;

  // Calculate health status
  const getHealthStatus = (): "healthy" | "elevated" | "locked" => {
    if (dailyMetrics?.locked_risk_mode) return "locked";
    if (behaviorMetrics && behaviorMetrics.evi_score >= 67) return "elevated";
    return "healthy";
  };

  const handleExecute = async (id: string) => {
    await execute(id);
  };

  const handleAdjust = (id: string) => {
    const candidate = candidates?.find(c => c.id === id);
    if (candidate) {
      setSelectedCandidate({
        id: candidate.id,
        entryPrice: Number(candidate.entry_price),
        slPrice: Number(candidate.sl_price),
        tpPrice: Number(candidate.tp_price) || 0,
        symbol: candidate.stopout_event?.symbol || 'UNKNOWN',
      });
      setAdjustModalOpen(true);
    }
  };

  const handleAdjustSave = async (data: { entryPrice: number; slPrice: number; tpPrice: number }) => {
    if (selectedCandidate) {
      await adjust({
        candidateId: selectedCandidate.id,
        ...data,
      });
    }
  };

  const handleIgnore = async (id: string) => {
    await ignore(id);
  };

  const handleCandidateClick = (id: string) => {
    navigate(`/app/candidates/${id}`);
  };

  if (!activeAccount && !accountLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
        <h2 className="text-lg font-semibold">No Account Found</h2>
        <p className="text-sm text-muted-foreground">
          Please refresh the page or contact support.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-20 lg:pb-6">
      {/* Page Title - Mobile */}
      <div className="lg:hidden">
        <h1 className="text-xl font-bold">Re-Entry HUD</h1>
        <p className="text-sm text-muted-foreground">Real-time trading intelligence</p>
      </div>

      {/* Health Banner */}
      {isLoading ? (
        <Skeleton className="h-40 w-full" />
      ) : (
        <HealthBanner 
          metrics={{
            dailyPnl: Number(dailyMetrics?.realized_pnl) || 0,
            realizedR: Number(dailyMetrics?.realized_r) || 0,
            lossStreak: dailyMetrics?.loss_streak || 0,
            maxDrawdown: Number(dailyMetrics?.max_drawdown) || 0,
            evi: Number(behaviorMetrics?.evi_score) || 50,
            status: getHealthStatus(),
          }} 
        />
      )}

      {/* Risk Snapshot */}
      {isLoading ? (
        <Skeleton className="h-32 w-full" />
      ) : (
        <RiskSnapshot 
          metrics={{
            reentriesUsed: dailyMetrics?.reentries_used || 0,
            maxReentries: accountSettings?.max_reentries_day || 3,
            cooldownSeconds: 0, // Would need real-time tracking
            manualOverrideActive: false,
            trustScore: Number(behaviorMetrics?.trust_score) || 50,
            lockedRiskMode: dailyMetrics?.locked_risk_mode || false,
          }} 
        />
      )}

      {/* Stop-Out Card */}
      {stopoutLoading ? (
        <Skeleton className="h-48 w-full" />
      ) : latestStopout ? (
        <StopOutCard 
          event={{
            id: latestStopout.id,
            symbol: latestStopout.symbol,
            side: latestStopout.side.toUpperCase() as "BUY" | "SELL",
            entryPrice: Number(latestStopout.entry_price),
            stopPrice: Number(latestStopout.stop_price),
            lots: Number(latestStopout.lots),
            occurredAt: new Date(latestStopout.occurred_at),
            session: latestStopout.session_label || 'Unknown',
            mode: latestStopout.mode as "live" | "test" | "train",
          }}
          recentEvents={recentStopouts?.slice(1).map(e => ({
            id: e.id,
            symbol: e.symbol,
            side: e.side.toUpperCase() as "BUY" | "SELL",
            entryPrice: Number(e.entry_price),
            stopPrice: Number(e.stop_price),
            lots: Number(e.lots),
            occurredAt: new Date(e.occurred_at),
            session: e.session_label || 'Unknown',
            mode: e.mode as "live" | "test" | "train",
          })) || []}
        />
      ) : (
        <div className="glass-card p-6 text-center">
          <p className="text-muted-foreground">No stop-outs recorded yet.</p>
          <p className="text-sm text-muted-foreground mt-1">
            Create a test stop-out below to see the system in action.
          </p>
        </div>
      )}

      {/* Test Stop-out Button */}
      <TestStopoutButton />

      {/* Candidate Stack */}
      <div className="space-y-3">
        <h2 className="flex items-center gap-2 text-lg font-semibold">
          <span className="text-primary">#</span>
          Re-Entry Candidates
          <span className="rounded-full bg-primary/20 px-2 py-0.5 text-xs font-medium text-primary">
            {candidates?.length || 0}
          </span>
        </h2>
        
        {candidatesLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        ) : candidates && candidates.length > 0 ? (
          <div className="space-y-3">
            {candidates.map((candidate, index) => (
              <CandidateCard
                key={candidate.id}
                candidate={{
                  id: candidate.id,
                  type: candidate.candidate_type,
                  entryPrice: Number(candidate.entry_price),
                  slPrice: Number(candidate.sl_price),
                  tpPrice: Number(candidate.tp_price) || 0,
                  rrRatio: Number(candidate.rr_ratio) || 0,
                  setupScore: Number(candidate.score) || 0,
                  personalConfidence: Number(candidate.personal_confidence_score) || 0,
                  trustContext: (candidate.trust_context_json as { session?: string })?.session || 'Standard setup',
                  riskFlags: (candidate.risk_flags_json as string[]) || [],
                  strategyTag: candidate.strategy_tag || 'Manual',
                  symbol: candidate.stopout_event?.symbol || 'UNKNOWN',
                  side: (candidate.stopout_event?.side?.toUpperCase() || 'BUY') as "BUY" | "SELL",
                  rules: ['Price rejected from key level', 'Session timing optimal', 'Risk/reward acceptable'],
                  status: candidate.status,
                }}
                rank={index + 1}
                onExecute={handleExecute}
                onAdjust={handleAdjust}
                onIgnore={handleIgnore}
                onClick={handleCandidateClick}
              />
            ))}
          </div>
        ) : (
          <div className="glass-card p-6 text-center">
            <p className="text-muted-foreground">No pending candidates.</p>
            <p className="text-sm text-muted-foreground mt-1">
              Candidates will appear after a stop-out event.
            </p>
          </div>
        )}
      </div>

      {/* Adjust Modal */}
      {selectedCandidate && (
        <AdjustCandidateModal
          isOpen={adjustModalOpen}
          onClose={() => {
            setAdjustModalOpen(false);
            setSelectedCandidate(null);
          }}
          onSave={handleAdjustSave}
          initialValues={{
            entryPrice: selectedCandidate.entryPrice,
            slPrice: selectedCandidate.slPrice,
            tpPrice: selectedCandidate.tpPrice,
          }}
          symbol={selectedCandidate.symbol}
        />
      )}
    </div>
  );
}