import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useActiveAccount } from "@/hooks/useActiveAccount";
import {
  Filter,
  TrendingUp,
  TrendingDown,
  Search,
  ChevronRight,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { statusToVariant, statusToLabel, candidateTypeToVariant } from "@/lib/badgeMaps";

const PAGE_SIZE = 25;

export default function History() {
  const { activeAccount } = useActiveAccount();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [page, setPage] = useState(0);

  // Fetch candidates with stopout data
  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['history', activeAccount?.id, page],
    queryFn: async () => {
      if (!activeAccount) return { candidates: [], hasMore: false };

      const from = page * PAGE_SIZE;
      const to = from + PAGE_SIZE;

      const { data, error, count } = await supabase
        .from('reentry_candidates')
        .select(`
          *,
          stopout_event:stopout_events(symbol, side, occurred_at)
        `, { count: 'exact' })
        .eq('account_id', activeAccount.id)
        .order('created_at', { ascending: false })
        .range(from, to - 1);

      if (error) throw error;

      return {
        candidates: data || [],
        hasMore: count ? from + PAGE_SIZE < count : false,
        total: count || 0,
      };
    },
    enabled: !!activeAccount,
  });

  // Filter candidates client-side
  const filteredCandidates = (data?.candidates || []).filter((c) => {
    const stopout = c.stopout_event as { symbol: string; side: string } | null;
    const symbol = stopout?.symbol || '';

    const matchesSearch = symbol.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === "all" || c.candidate_type === typeFilter;
    const matchesStatus = statusFilter === "all" || c.status === statusFilter;

    return matchesSearch && matchesType && matchesStatus;
  });

  if (!activeAccount) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">No account selected</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-20 lg:pb-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold">Trade History</h1>
          <p className="text-sm text-muted-foreground">
            {data?.total || 0} re-entry candidates
          </p>
        </div>
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
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[140px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="executed">Confirmed</SelectItem>
              <SelectItem value="ignored">Ignored</SelectItem>
              <SelectItem value="expired">Expired</SelectItem>
              <SelectItem value="blocked">Blocked</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      )}

      {/* History List */}
      {!isLoading && (
        <div className="space-y-2">
          {filteredCandidates.map((candidate) => {
            const stopout = candidate.stopout_event as { symbol: string; side: string; occurred_at: string } | null;

            return (
              <button
                key={candidate.id}
                onClick={() => navigate(`/app/candidates/${candidate.id}`)}
                className="glass-card flex w-full items-center gap-4 p-4 text-left transition-colors hover:bg-accent/50"
              >
                {/* Symbol & Direction */}
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-lg",
                    stopout?.side?.toLowerCase() === "buy" ? "bg-success/20" : "bg-danger/20"
                  )}>
                    {stopout?.side?.toLowerCase() === "buy" ? (
                      <TrendingUp className="h-5 w-5 text-success" />
                    ) : (
                      <TrendingDown className="h-5 w-5 text-danger" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-medium">{stopout?.symbol || 'Unknown'}</span>
                      <Badge variant={candidateTypeToVariant(candidate.candidate_type)} className="text-[10px]">
                        {candidate.candidate_type}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {new Date(candidate.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {/* Metrics */}
                <div className="hidden flex-1 grid-cols-4 gap-4 sm:grid">
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground">Score</p>
                    <span className="font-mono font-medium">{candidate.score?.toFixed(0) || '-'}</span>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground">RR</p>
                    <span className="font-mono font-medium">{candidate.rr_ratio?.toFixed(1) || '-'}</span>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground">Confidence</p>
                    <span className="font-mono font-medium">{candidate.personal_confidence_score?.toFixed(0) || '-'}%</span>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground">Entry</p>
                    <span className="font-mono font-medium text-xs">{Number(candidate.entry_price).toFixed(5)}</span>
                  </div>
                </div>

                {/* Status */}
                <Badge variant={statusToVariant(candidate.status)}>
                  {statusToLabel(candidate.status)}
                </Badge>

                {/* Arrow */}
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </button>
            );
          })}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && filteredCandidates.length === 0 && (
        <div className="glass-card flex flex-col items-center justify-center py-12 text-center">
          <Filter className="h-12 w-12 text-muted-foreground/50" />
          <h3 className="mt-4 font-medium">No candidates found</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {data?.total === 0
              ? "Create a test stop-out from the Dashboard to get started"
              : "Adjust your filters or search query"}
          </p>
          {data?.total === 0 && (
            <Button
              variant="outline"
              className="mt-4 gap-2"
              onClick={() => navigate('/app/dashboard')}
            >
              <Plus className="h-4 w-4" />
              Go to Dashboard
            </Button>
          )}
        </div>
      )}

      {/* Load More */}
      {!isLoading && data?.hasMore && (
        <div className="flex justify-center">
          <Button
            variant="outline"
            onClick={() => setPage((p) => p + 1)}
            disabled={isFetching}
          >
            {isFetching ? 'Loading...' : 'Load More'}
          </Button>
        </div>
      )}
    </div>
  );
}
