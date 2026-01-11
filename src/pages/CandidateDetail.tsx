import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useActiveAccount } from "@/hooks/useActiveAccount";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, CheckCircle } from "lucide-react";
import { statusToVariant, candidateTypeToVariant } from "@/lib/badgeMaps";

export default function CandidateDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { activeAccount } = useActiveAccount();

  const { data: candidate, isLoading } = useQuery({
    queryKey: ['candidate', id],
    queryFn: async () => {
      if (!id || !activeAccount) return null;

      const { data, error } = await supabase
        .from('reentry_candidates')
        .select(`*, stopout_event:stopout_events(*)`)
        .eq('id', id)
        .eq('account_id', activeAccount.id)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!id && !!activeAccount,
  });

  if (isLoading) {
    return (
      <div className="space-y-4 pb-20">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (!candidate) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Candidate not found.</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate('/app/dashboard')}>
          Back to Dashboard
        </Button>
      </div>
    );
  }

  const stopout = candidate.stopout_event as { symbol: string; side: string } | null;

  return (
    <div className="space-y-4 pb-20 lg:pb-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon-sm" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            {stopout?.symbol || 'Unknown'}
            <Badge variant={candidateTypeToVariant(candidate.candidate_type)}>
              {candidate.candidate_type}
            </Badge>
          </h1>
          <p className="text-sm text-muted-foreground">Candidate Detail</p>
        </div>
      </div>

      {/* Summary Card */}
      <div className="glass-card-elevated p-4">
        <h3 className="font-medium mb-3">Summary</h3>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div><p className="metric-label">Entry</p><span className="metric-value">{Number(candidate.entry_price).toFixed(5)}</span></div>
          <div><p className="metric-label">SL</p><span className="metric-value text-danger">{Number(candidate.sl_price).toFixed(5)}</span></div>
          <div><p className="metric-label">TP</p><span className="metric-value text-success">{Number(candidate.tp_price).toFixed(5)}</span></div>
          <div><p className="metric-label">RR</p><span className="metric-value">{Number(candidate.rr_ratio).toFixed(1)}</span></div>
          <div><p className="metric-label">Score</p><span className="metric-value">{Number(candidate.score).toFixed(0)}</span></div>
          <div><p className="metric-label">Confidence</p><span className="metric-value">{Number(candidate.personal_confidence_score).toFixed(0)}%</span></div>
          <div><p className="metric-label">Status</p><Badge variant={statusToVariant(candidate.status)}>{candidate.status}</Badge></div>
          <div><p className="metric-label">Strategy</p><span className="text-sm">{candidate.strategy_tag}</span></div>
        </div>
      </div>

      {/* Explainability */}
      <div className="glass-card p-4">
        <h3 className="font-medium mb-3 flex items-center gap-2"><CheckCircle className="h-4 w-4 text-success" />Decision Rules</h3>
        <ul className="space-y-2 text-sm">
          {((candidate.decision_rules_fired_json as string[]) || []).map((rule, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="text-success">✓</span> {rule}
            </li>
          ))}
        </ul>
      </div>

      {/* Parallel Reality */}
      <div className="glass-card p-4">
        <h3 className="font-medium mb-3">Parallel Reality Outcomes</h3>
        <p className="text-sm text-muted-foreground">Outcome analysis will be computed after trade closure.</p>
      </div>
    </div>
  );
}