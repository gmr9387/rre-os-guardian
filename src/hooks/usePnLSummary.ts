import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useActiveAccount } from './useActiveAccount';

export interface PnLSummary {
  startingBalance: number;
  totalPnl: number;
  currentBalance: number;
  pnlPct: number;
  totalR: number;
  winDays: number;
  lossDays: number;
  todayPnl: number;
}

export function usePnLSummary() {
  const { activeAccount } = useActiveAccount();

  return useQuery<PnLSummary | null>({
    queryKey: ['pnl_summary', activeAccount?.id],
    queryFn: async () => {
      if (!activeAccount) return null;

      // Fetch both daily metrics and account settings in parallel
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
      const totalPnl = rows.reduce((sum, r) => sum + (Number(r.realized_pnl) || 0), 0);
      const totalR = rows.reduce((sum, r) => sum + (Number(r.realized_r) || 0), 0);
      const today = new Date().toISOString().split('T')[0];
      const todayRow = rows.find(r => r.date === today);
      const todayPnl = Number(todayRow?.realized_pnl) || 0;
      const winDays = rows.filter(r => (Number(r.realized_pnl) || 0) > 0).length;
      const lossDays = rows.filter(r => (Number(r.realized_pnl) || 0) < 0).length;

      return {
        startingBalance,
        totalPnl,
        currentBalance: startingBalance + totalPnl,
        pnlPct: startingBalance > 0 ? (totalPnl / startingBalance) * 100 : 0,
        totalR,
        winDays,
        lossDays,
        todayPnl,
      };
    },
    enabled: !!activeAccount,
  });
}
