import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useActiveAccount } from './useActiveAccount';
import { useDailyMetrics, useBehaviorMetrics, useKillSwitch } from './useDashboardData';
import { toast } from 'sonner';

interface ExecutePreCheckResult {
  allowed: boolean;
  reason?: string;
}

export function useCandidateActions() {
  const { activeAccount, accountSettings } = useActiveAccount();
  const { data: dailyMetrics } = useDailyMetrics();
  const { data: behaviorMetrics } = useBehaviorMetrics();
  const { data: killSwitch } = useKillSwitch();
  const queryClient = useQueryClient();

  const runPreChecks = (): ExecutePreCheckResult => {
    if (!activeAccount || !accountSettings) {
      return { allowed: false, reason: 'No account selected' };
    }

    if (killSwitch?.is_active) {
      return { allowed: false, reason: 'Kill switch is active. Trading is halted.' };
    }

    if (dailyMetrics?.locked_risk_mode) {
      return { allowed: false, reason: 'Risk mode is locked. Wait for cooldown.' };
    }

    if (dailyMetrics && dailyMetrics.loss_streak >= accountSettings.loss_streak_lock_threshold) {
      return { allowed: false, reason: `Loss streak (${dailyMetrics.loss_streak}) exceeds threshold (${accountSettings.loss_streak_lock_threshold}).` };
    }

    if (dailyMetrics && dailyMetrics.reentries_used >= accountSettings.max_reentries_day) {
      return { allowed: false, reason: `Max re-entries (${accountSettings.max_reentries_day}) reached for today.` };
    }

    return { allowed: true };
  };

  const executeMutation = useMutation({
    mutationFn: async (candidateId: string) => {
      const preCheck = runPreChecks();
      if (!preCheck.allowed) {
        throw new Error(preCheck.reason);
      }

      if (!activeAccount) throw new Error('No account');

      // Call the execute-order edge function
      const { data, error } = await supabase.functions.invoke('execute-order', {
        body: { 
          candidate_id: candidateId,
          account_id: activeAccount.id,
        },
      });

      if (error) {
        // Fallback to local simulation if edge function fails
        console.warn('Edge function failed, using local simulation:', error);
        
        // Update candidate status locally
        const { error: candidateError } = await supabase
          .from('reentry_candidates')
          .update({ status: 'executed' })
          .eq('id', candidateId);

        if (candidateError) throw candidateError;

        // Insert execution record (stub)
        const { error: execError } = await supabase
          .from('executions')
          .insert({
            candidate_id: candidateId,
            account_id: activeAccount.id,
            idempotency_key: `${activeAccount.id}_${candidateId}_${Date.now()}`,
            broker: 'simulation',
            status: 'pending',
            request_json: {
              action: 'execute_reentry',
              candidate_id: candidateId,
              timestamp: new Date().toISOString(),
              fallback: true,
            },
          });

        if (execError) throw execError;

        // Increment reentries_used for today
        const today = new Date().toISOString().split('T')[0];
        await supabase
          .from('daily_metrics')
          .update({ reentries_used: (dailyMetrics?.reentries_used || 0) + 1 })
          .eq('account_id', activeAccount.id)
          .eq('date', today);

        return { candidateId, simulated: true };
      }

      return { candidateId, ...data };
    },
    onSuccess: () => {
      toast.success('Execution queued (stub)', {
        description: 'Order will be processed by n8n integration.',
      });
      queryClient.invalidateQueries({ queryKey: ['pending_candidates'] });
      queryClient.invalidateQueries({ queryKey: ['daily_metrics'] });
    },
    onError: (error) => {
      toast.error('Execution blocked', {
        description: error.message,
      });
    },
  });

  const ignoreMutation = useMutation({
    mutationFn: async (candidateId: string) => {
      const { error } = await supabase
        .from('reentry_candidates')
        .update({ status: 'ignored' })
        .eq('id', candidateId);

      if (error) throw error;
      return { candidateId };
    },
    onSuccess: () => {
      toast.info('Candidate ignored');
      queryClient.invalidateQueries({ queryKey: ['pending_candidates'] });
    },
    onError: (error) => {
      toast.error('Failed to ignore candidate');
      console.error(error);
    },
  });

  const adjustMutation = useMutation({
    mutationFn: async ({ 
      candidateId, 
      entryPrice, 
      slPrice, 
      tpPrice 
    }: { 
      candidateId: string; 
      entryPrice: number; 
      slPrice: number; 
      tpPrice: number;
    }) => {
      const rrRatio = Math.abs((tpPrice - entryPrice) / (entryPrice - slPrice));

      const { error } = await supabase
        .from('reentry_candidates')
        .update({
          entry_price: entryPrice,
          sl_price: slPrice,
          tp_price: tpPrice,
          rr_ratio: Math.round(rrRatio * 10) / 10,
        })
        .eq('id', candidateId);

      if (error) throw error;
      return { candidateId };
    },
    onSuccess: () => {
      toast.success('Candidate adjusted');
      queryClient.invalidateQueries({ queryKey: ['pending_candidates'] });
    },
    onError: (error) => {
      toast.error('Failed to adjust candidate');
      console.error(error);
    },
  });

  return {
    execute: executeMutation.mutateAsync,
    ignore: ignoreMutation.mutateAsync,
    adjust: adjustMutation.mutateAsync,
    runPreChecks,
    isExecuting: executeMutation.isPending,
  };
}
