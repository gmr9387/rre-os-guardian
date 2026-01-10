import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useActiveAccount } from './useActiveAccount';

interface DailyMetrics {
  realized_pnl: number;
  realized_r: number;
  max_drawdown: number;
  loss_streak: number;
  reentries_used: number;
  locked_risk_mode: boolean;
}

interface BehaviorMetrics {
  evi_score: number;
  trust_score: number;
  override_count: number;
  cooldown_violations: number;
}

interface StopoutEvent {
  id: string;
  symbol: string;
  side: 'buy' | 'sell';
  lots: number;
  entry_price: number;
  stop_price: number;
  occurred_at: string;
  session_label: string | null;
  mode: 'live' | 'test' | 'train';
}

interface ReentryCandidate {
  id: string;
  event_id: string;
  candidate_type: 'reclaim' | 'retest' | 'ladder';
  entry_price: number;
  sl_price: number;
  tp_price: number | null;
  rr_ratio: number | null;
  score: number | null;
  personal_confidence_score: number | null;
  score_tags: string[] | null;
  strategy_tag: string | null;
  risk_flags_json: string[];
  trust_context_json: Record<string, unknown>;
  status: 'pending' | 'executed' | 'ignored' | 'expired' | 'blocked';
  blocked_reason: string | null;
  stopout_event?: StopoutEvent;
}

interface KillSwitch {
  is_active: boolean;
  reason: string | null;
}

export function useDailyMetrics() {
  const { activeAccount } = useActiveAccount();
  const today = new Date().toISOString().split('T')[0];

  return useQuery({
    queryKey: ['daily_metrics', activeAccount?.id, today],
    queryFn: async () => {
      if (!activeAccount) return null;

      const { data, error } = await supabase
        .from('daily_metrics')
        .select('*')
        .eq('account_id', activeAccount.id)
        .eq('date', today)
        .maybeSingle();

      if (error) throw error;

      // Return defaults if no data
      return (data as DailyMetrics) || {
        realized_pnl: 0,
        realized_r: 0,
        max_drawdown: 0,
        loss_streak: 0,
        reentries_used: 0,
        locked_risk_mode: false,
      };
    },
    enabled: !!activeAccount,
  });
}

export function useBehaviorMetrics() {
  const { activeAccount } = useActiveAccount();
  const today = new Date().toISOString().split('T')[0];

  return useQuery({
    queryKey: ['behavior_metrics', activeAccount?.id, today],
    queryFn: async () => {
      if (!activeAccount) return null;

      const { data, error } = await supabase
        .from('behavior_metrics')
        .select('*')
        .eq('account_id', activeAccount.id)
        .eq('date', today)
        .maybeSingle();

      if (error) throw error;

      return (data as BehaviorMetrics) || {
        evi_score: 50,
        trust_score: 50,
        override_count: 0,
        cooldown_violations: 0,
      };
    },
    enabled: !!activeAccount,
  });
}

export function useLatestStopout() {
  const { activeAccount } = useActiveAccount();

  return useQuery({
    queryKey: ['latest_stopout', activeAccount?.id],
    queryFn: async () => {
      if (!activeAccount) return null;

      const { data, error } = await supabase
        .from('stopout_events')
        .select('*')
        .eq('account_id', activeAccount.id)
        .order('occurred_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return data as StopoutEvent | null;
    },
    enabled: !!activeAccount,
  });
}

export function useRecentStopouts(limit = 3) {
  const { activeAccount } = useActiveAccount();

  return useQuery({
    queryKey: ['recent_stopouts', activeAccount?.id, limit],
    queryFn: async () => {
      if (!activeAccount) return [];

      const { data, error } = await supabase
        .from('stopout_events')
        .select('*')
        .eq('account_id', activeAccount.id)
        .order('occurred_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return (data as StopoutEvent[]) || [];
    },
    enabled: !!activeAccount,
  });
}

export function usePendingCandidates() {
  const { activeAccount } = useActiveAccount();
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  return useQuery({
    queryKey: ['pending_candidates', activeAccount?.id],
    queryFn: async () => {
      if (!activeAccount) return [];

      const { data, error } = await supabase
        .from('reentry_candidates')
        .select(`
          *,
          stopout_event:stopout_events(*)
        `)
        .eq('account_id', activeAccount.id)
        .in('status', ['pending', 'blocked'])
        .gte('created_at', yesterday)
        .order('score', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(3);

      if (error) throw error;
      return (data as unknown as ReentryCandidate[]) || [];
    },
    enabled: !!activeAccount,
  });
}

export function useKillSwitch() {
  const { activeAccount } = useActiveAccount();

  return useQuery({
    queryKey: ['kill_switch', activeAccount?.id],
    queryFn: async () => {
      if (!activeAccount) return null;

      const { data, error } = await supabase
        .from('kill_switch')
        .select('*')
        .eq('account_id', activeAccount.id)
        .maybeSingle();

      if (error) throw error;
      return data as KillSwitch | null;
    },
    enabled: !!activeAccount,
  });
}
