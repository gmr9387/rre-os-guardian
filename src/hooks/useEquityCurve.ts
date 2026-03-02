import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useActiveAccount } from './useActiveAccount';

export interface EquityPoint {
  date: string;
  balance: number;
  pnl: number;
}

export function useEquityCurve() {
  const { activeAccount } = useActiveAccount();

  return useQuery<EquityPoint[]>({
    queryKey: ['equity_curve', activeAccount?.id],
    queryFn: async () => {
      if (!activeAccount) return [];

      const [metricsResult, settingsResult] = await Promise.all([
        supabase
          .from('daily_metrics')
          .select('realized_pnl, date')
          .eq('account_id', activeAccount.id)
          .order('date', { ascending: true }),
        supabase
          .from('account_settings')
          .select('starting_balance')
          .eq('account_id', activeAccount.id)
          .maybeSingle(),
      ]);

      if (metricsResult.error) throw metricsResult.error;

      const rows = metricsResult.data || [];
      const startingBalance = Number(settingsResult.data?.starting_balance) || 10000;

      let cumulative = startingBalance;
      const points: EquityPoint[] = [
        { date: 'Start', balance: startingBalance, pnl: 0 },
      ];

      for (const row of rows) {
        const pnl = Number(row.realized_pnl) || 0;
        cumulative += pnl;
        points.push({
          date: row.date,
          balance: cumulative,
          pnl,
        });
      }

      return points;
    },
    enabled: !!activeAccount,
  });
}
