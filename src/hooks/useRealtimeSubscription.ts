import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useActiveAccount } from './useActiveAccount';

/**
 * Hook to subscribe to real-time updates for dashboard data.
 * Automatically invalidates relevant queries when data changes.
 */
export function useRealtimeSubscription() {
  const { activeAccount } = useActiveAccount();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!activeAccount) return;

    console.log('[Realtime] Setting up subscriptions for account:', activeAccount.id);

    // Subscribe to candidates changes
    const candidatesChannel = supabase
      .channel('candidates-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'reentry_candidates',
          filter: `account_id=eq.${activeAccount.id}`,
        },
        (payload) => {
          console.log('[Realtime] Candidates changed:', payload.eventType);
          queryClient.invalidateQueries({ queryKey: ['pending_candidates'] });
        }
      )
      .subscribe();

    // Subscribe to executions changes
    const executionsChannel = supabase
      .channel('executions-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'executions',
          filter: `account_id=eq.${activeAccount.id}`,
        },
        (payload) => {
          console.log('[Realtime] Executions changed:', payload.eventType);
          queryClient.invalidateQueries({ queryKey: ['pending_candidates'] });
          queryClient.invalidateQueries({ queryKey: ['daily_metrics'] });
        }
      )
      .subscribe();

    // Subscribe to stopout events
    const stopoutsChannel = supabase
      .channel('stopouts-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'stopout_events',
          filter: `account_id=eq.${activeAccount.id}`,
        },
        (payload) => {
          console.log('[Realtime] New stopout event:', payload.new);
          queryClient.invalidateQueries({ queryKey: ['latest_stopout'] });
          queryClient.invalidateQueries({ queryKey: ['recent_stopouts'] });
          queryClient.invalidateQueries({ queryKey: ['pending_candidates'] });
        }
      )
      .subscribe();

    // Cleanup
    return () => {
      console.log('[Realtime] Cleaning up subscriptions');
      supabase.removeChannel(candidatesChannel);
      supabase.removeChannel(executionsChannel);
      supabase.removeChannel(stopoutsChannel);
    };
  }, [activeAccount?.id, queryClient]);
}
