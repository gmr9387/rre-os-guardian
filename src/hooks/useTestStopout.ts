import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useActiveAccount } from './useActiveAccount';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

const SYMBOLS = ['EURUSD', 'GBPUSD', 'XAUUSD', 'NAS100', 'US30'];
const SESSIONS = ['London', 'New York', 'Asian', 'Overlap'];

function getRandomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getPlausiblePrices(symbol: string, side: 'buy' | 'sell') {
  const basePrices: Record<string, { price: number; pip: number }> = {
    EURUSD: { price: 1.085, pip: 0.0001 },
    GBPUSD: { price: 1.265, pip: 0.0001 },
    XAUUSD: { price: 2350, pip: 0.1 },
    NAS100: { price: 19500, pip: 1 },
    US30: { price: 39500, pip: 1 },
  };

  const config = basePrices[symbol] || { price: 1.0, pip: 0.0001 };
  const variance = config.pip * (Math.random() * 50 - 25);
  const entryPrice = config.price + variance;
  const stopDistance = config.pip * (20 + Math.random() * 30);

  const stopPrice = side === 'buy' 
    ? entryPrice - stopDistance 
    : entryPrice + stopDistance;

  return { entryPrice, stopPrice, pip: config.pip };
}

export function useTestStopout() {
  const { user } = useAuth();
  const { activeAccount } = useActiveAccount();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!user || !activeAccount) {
        throw new Error('No user or account');
      }

      const symbol = getRandomElement(SYMBOLS);
      const side = Math.random() > 0.5 ? 'buy' : 'sell';
      const { entryPrice, stopPrice, pip } = getPlausiblePrices(symbol, side);
      const session = getRandomElement(SESSIONS);

      // Insert stopout event
      const { data: stopout, error: stopoutError } = await supabase
        .from('stopout_events')
        .insert({
          user_id: user.id,
          account_id: activeAccount.id,
          symbol,
          side,
          lots: 0.1,
          entry_price: entryPrice,
          stop_price: stopPrice,
          session_label: session,
          mode: 'test',
          source: 'manual',
          occurred_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (stopoutError) throw stopoutError;

      // Create 3 candidates: reclaim, retest, ladder
      const candidateTypes: Array<'reclaim' | 'retest' | 'ladder'> = ['reclaim', 'retest', 'ladder'];
      const stopDistance = Math.abs(entryPrice - stopPrice);

      const candidates = candidateTypes.map((type, idx) => {
        // Vary entry based on type
        const entryOffset = side === 'buy' ? pip * (5 + idx * 10) : -pip * (5 + idx * 10);
        const candidateEntry = stopPrice + entryOffset;
        const slOffset = side === 'buy' ? -stopDistance * 0.5 : stopDistance * 0.5;
        const tpOffset = side === 'buy' ? stopDistance * (1.5 + idx * 0.5) : -stopDistance * (1.5 + idx * 0.5);
        
        const slPrice = candidateEntry + slOffset;
        const tpPrice = candidateEntry + tpOffset;
        const rrRatio = Math.abs(tpOffset / slOffset);

        return {
          user_id: user.id,
          account_id: activeAccount.id,
          event_id: stopout.id,
          candidate_type: type,
          order_type: 'limit',
          entry_price: candidateEntry,
          sl_price: slPrice,
          tp_price: tpPrice,
          rr_ratio: Math.round(rrRatio * 10) / 10,
          score: 70 + Math.random() * 25,
          personal_confidence_score: 50 + Math.random() * 40,
          score_tags: ['Session aligned', 'Structure valid'],
          strategy_tag: `${session} ${type.charAt(0).toUpperCase() + type.slice(1)}`,
          risk_flags_json: idx === 2 ? ['High volatility'] : [],
          decision_rules_fired_json: [
            'Price rejected from key level',
            'Session timing optimal',
            'Risk/reward acceptable',
          ],
          trust_context_json: { session, symbol },
          status: 'pending' as const,
        };
      });

      const { error: candidatesError } = await supabase
        .from('reentry_candidates')
        .insert(candidates);

      if (candidatesError) throw candidatesError;

      return { stopout, candidateCount: candidates.length };
    },
    onSuccess: (data) => {
      toast.success('Test stop-out created', {
        description: `Created ${data.candidateCount} candidates for testing`,
      });
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['latest_stopout'] });
      queryClient.invalidateQueries({ queryKey: ['recent_stopouts'] });
      queryClient.invalidateQueries({ queryKey: ['pending_candidates'] });
    },
    onError: (error) => {
      console.error('Error creating test stopout:', error);
      toast.error('Failed to create test stop-out');
    },
  });
}
