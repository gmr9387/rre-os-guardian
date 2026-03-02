import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useActiveAccount } from './useActiveAccount';

export interface EquityPoint {
  date: string;
  balance: number;
  pnl: number;
  cumulativeR: number;
  dailyR: number;
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
          .select('realized_pnl, realized_r, date')
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

      let cumBalance = startingBalance;
      let cumR = 0;
      const points: EquityPoint[] = [
        { date: 'Start', balance: startingBalance, pnl: 0, cumulativeR: 0, dailyR: 0 },
      ];

      for (const row of rows) {
        const pnl = Number(row.realized_pnl) || 0;
        const r = Number(row.realized_r) || 0;
        cumBalance += pnl;
        cumR += r;
        points.push({
          date: row.date,
          balance: cumBalance,
          pnl,
          cumulativeR: Math.round(cumR * 10) / 10,
          dailyR: Math.round(r * 10) / 10,
        });
      }

      return points;
    },
    enabled: !!activeAccount,
  });
}
