import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useActiveAccount } from './useActiveAccount';
import { toast } from 'sonner';

export interface PlaybookStrategy {
  id: string;
  tag: string;
  description: string;
  winrate: number;
  avgR: number;
  medianR: number;
  tradeCount: number;
  enabled: boolean;
}

// Default strategies for new accounts
const defaultStrategies: Omit<PlaybookStrategy, 'id'>[] = [
  {
    tag: "London Reclaim",
    description: "Re-entry on session high/low reclaim after initial stop-out",
    winrate: 0,
    avgR: 0,
    medianR: 0,
    tradeCount: 0,
    enabled: true,
  },
  {
    tag: "Structure Retest",
    description: "Retest of broken structure level for continuation",
    winrate: 0,
    avgR: 0,
    medianR: 0,
    tradeCount: 0,
    enabled: true,
  },
  {
    tag: "Ladder Scale",
    description: "Progressive scaling into position with averaged entry",
    winrate: 0,
    avgR: 0,
    medianR: 0,
    tradeCount: 0,
    enabled: false,
  },
  {
    tag: "News Fade",
    description: "Fading overextended moves after news-driven spikes",
    winrate: 0,
    avgR: 0,
    medianR: 0,
    tradeCount: 0,
    enabled: false,
  },
  {
    tag: "Session Overlap",
    description: "Trading continuation during session transition periods",
    winrate: 0,
    avgR: 0,
    medianR: 0,
    tradeCount: 0,
    enabled: true,
  },
];

export function usePlaybookStrategies() {
  const { activeAccount, accountSettings } = useActiveAccount();
  const queryClient = useQueryClient();

  const { data: strategies, isLoading } = useQuery({
    queryKey: ['playbook_strategies', activeAccount?.id],
    queryFn: async () => {
      if (!activeAccount) return [];

      // Get per_symbol_caps from account_settings
      // We'll use this to store strategy enabled states
      const perSymbolCaps = (accountSettings?.per_symbol_caps || {}) as Record<string, unknown>;
      const strategySettings = (perSymbolCaps.strategies || {}) as Record<string, { enabled: boolean }>;

      // Merge default strategies with saved settings
      return defaultStrategies.map((strategy, index) => {
        const savedSetting = strategySettings[strategy.tag];
        return {
          ...strategy,
          id: `strategy-${index}`,
          enabled: savedSetting?.enabled ?? strategy.enabled,
        };
      });
    },
    enabled: !!activeAccount,
  });

  const toggleStrategyMutation = useMutation({
    mutationFn: async ({ tag, enabled }: { tag: string; enabled: boolean }) => {
      if (!activeAccount || !accountSettings) throw new Error('No account');

      const perSymbolCaps = (accountSettings.per_symbol_caps || {}) as Record<string, unknown>;
      const strategySettings = (perSymbolCaps.strategies || {}) as Record<string, { enabled: boolean }>;

      const updatedStrategies = {
        ...strategySettings,
        [tag]: { enabled },
      };

      const { error } = await supabase
        .from('account_settings')
        .update({
          per_symbol_caps: {
            ...perSymbolCaps,
            strategies: updatedStrategies,
          },
        })
        .eq('account_id', activeAccount.id);

      if (error) throw error;
    },
    onSuccess: (_, { tag, enabled }) => {
      toast.success(`${tag} ${enabled ? 'enabled' : 'disabled'}`);
      queryClient.invalidateQueries({ queryKey: ['playbook_strategies'] });
    },
    onError: (error) => {
      toast.error('Failed to update strategy');
      console.error(error);
    },
  });

  return {
    strategies: strategies || [],
    isLoading,
    toggleStrategy: (tag: string, enabled: boolean) => 
      toggleStrategyMutation.mutate({ tag, enabled }),
    isToggling: toggleStrategyMutation.isPending,
  };
}
