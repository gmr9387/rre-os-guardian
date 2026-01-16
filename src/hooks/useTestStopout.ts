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
      const { entryPrice, stopPrice } = getPlausiblePrices(symbol, side);
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

      // Call edge function to generate candidates with AI-powered scoring
      const { data: candidateData, error: candidateError } = await supabase.functions.invoke(
        'generate-candidates',
        {
          body: { stopout_id: stopout.id },
        }
      );

      if (candidateError) {
        console.error('Failed to generate candidates via edge function:', candidateError);
        throw new Error('Failed to generate candidates');
      }

      return { 
        stopout, 
        candidateCount: candidateData?.candidates?.length || 0,
        bestScore: candidateData?.summary?.bestScore,
      };
    },
    onSuccess: (data) => {
      toast.success('Test stop-out created', {
        description: `Created ${data.candidateCount} candidates (Best score: ${data.bestScore})`,
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
