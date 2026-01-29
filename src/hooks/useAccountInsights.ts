import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useActiveAccount } from './useActiveAccount';

export interface AlphaFingerprint {
  strengths: string[];
  weaknesses: string[];
}

export interface SymbolStat {
  symbol: string;
  winrate: number;
  trades: number;
}

export interface SessionStat {
  session: string;
  winrate: number;
}

export interface CandidateTypeStat {
  type: string;
  avgR: number;
}

export interface RRBandStat {
  band: string;
  winrate: number;
}

export interface AccountInsights {
  id: string;
  account_id: string;
  alpha_fingerprint: AlphaFingerprint;
  best_symbols: SymbolStat[];
  best_sessions: SessionStat[];
  best_candidate_types: CandidateTypeStat[];
  rr_band_stats: RRBandStat[];
  avoid_conditions: string[];
  created_at: string;
  updated_at: string;
}

// Default insights for new accounts
const defaultInsights = {
  alpha_fingerprint: {
    strengths: [
      "Getting started with RRE OS",
      "Building trading discipline",
      "Learning risk management",
    ],
    weaknesses: [
      "Need more trade data for analysis",
      "Continue logging trades to build profile",
    ],
  },
  best_symbols: [] as SymbolStat[],
  best_sessions: [] as SessionStat[],
  best_candidate_types: [] as CandidateTypeStat[],
  rr_band_stats: [] as RRBandStat[],
  avoid_conditions: ["High EVI (>60)", "Pre-news (15 min)", "Loss streak ≥3"],
};

export function useAccountInsights() {
  const { activeAccount } = useActiveAccount();

  const { data: insights, isLoading, error } = useQuery({
    queryKey: ['account_insights', activeAccount?.id],
    queryFn: async () => {
      if (!activeAccount) return null;

      const { data, error } = await supabase
        .from('account_insights')
        .select('*')
        .eq('account_id', activeAccount.id)
        .maybeSingle();

      if (error) throw error;

      // Create default insights if none exist
      if (!data) {
        const { data: newData, error: insertError } = await supabase
          .from('account_insights')
          .insert([{
            account_id: activeAccount.id,
            alpha_fingerprint_json: JSON.parse(JSON.stringify(defaultInsights.alpha_fingerprint)),
            best_symbols_json: JSON.parse(JSON.stringify(defaultInsights.best_symbols)),
            best_sessions_json: JSON.parse(JSON.stringify(defaultInsights.best_sessions)),
            best_candidate_types_json: JSON.parse(JSON.stringify(defaultInsights.best_candidate_types)),
            rr_band_stats_json: JSON.parse(JSON.stringify(defaultInsights.rr_band_stats)),
            avoid_conditions_json: JSON.parse(JSON.stringify(defaultInsights.avoid_conditions)),
          }])
          .select()
          .single();

        if (insertError) throw insertError;

        return transformDbToInsights(newData);
      }

      return transformDbToInsights(data);
    },
    enabled: !!activeAccount,
  });

  return {
    insights,
    isLoading,
    error,
  };
}

// Transform DB row to typed interface
function transformDbToInsights(data: Record<string, unknown>): AccountInsights {
  return {
    id: data.id as string,
    account_id: data.account_id as string,
    alpha_fingerprint: (data.alpha_fingerprint_json as AlphaFingerprint) || defaultInsights.alpha_fingerprint,
    best_symbols: (data.best_symbols_json as SymbolStat[]) || [],
    best_sessions: (data.best_sessions_json as SessionStat[]) || [],
    best_candidate_types: (data.best_candidate_types_json as CandidateTypeStat[]) || [],
    rr_band_stats: (data.rr_band_stats_json as RRBandStat[]) || [],
    avoid_conditions: (data.avoid_conditions_json as string[]) || [],
    created_at: data.created_at as string,
    updated_at: data.updated_at as string,
  };
}
