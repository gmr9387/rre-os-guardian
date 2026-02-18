import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Account {
  id: string;
  label: string;
  risk_profile: 'conservative' | 'normal' | 'aggressive';
  metaapi_account_id: string | null;
  is_demo: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface AccountSettings {
  id: string;
  account_id: string;
  mode: 'assist' | 'auto' | 'safe';
  max_reentries_day: number;
  cooldown_seconds: number;
  max_daily_loss_pct: number;
  loss_streak_lock_threshold: number;
  lock_duration_minutes: number;
  per_symbol_caps: Record<string, number>;
  two_step_confirm_enabled: boolean;
  starting_balance: number;
}

interface ActiveAccountContextType {
  accounts: Account[];
  activeAccount: Account | null;
  accountSettings: AccountSettings | null;
  setActiveAccountId: (id: string) => void;
  loading: boolean;
  refetch: () => Promise<void>;
}

const ActiveAccountContext = createContext<ActiveAccountContextType | undefined>(undefined);

const ACTIVE_ACCOUNT_KEY = 'rre_active_account_id';

export function ActiveAccountProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [activeAccount, setActiveAccount] = useState<Account | null>(null);
  const [accountSettings, setAccountSettings] = useState<AccountSettings | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchAccounts = async () => {
    if (!user) {
      setAccounts([]);
      setActiveAccount(null);
      setAccountSettings(null);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('accounts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      if (error) throw error;

      setAccounts(data || []);

      // Restore active account from localStorage or use first
      const savedId = localStorage.getItem(ACTIVE_ACCOUNT_KEY);
      const savedAccount = data?.find(a => a.id === savedId);
      const selected = savedAccount || data?.[0] || null;
      
      setActiveAccount(selected);

      // Fetch account settings if we have an active account
      if (selected) {
        const { data: settings } = await supabase
          .from('account_settings')
          .select('*')
          .eq('account_id', selected.id)
          .maybeSingle();

        setAccountSettings(settings as AccountSettings | null);
      }
    } catch (error) {
      console.error('Error fetching accounts:', error);
      toast.error('Failed to load accounts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, [user]);

  const setActiveAccountId = async (id: string) => {
    const account = accounts.find(a => a.id === id);
    if (!account) return;

    localStorage.setItem(ACTIVE_ACCOUNT_KEY, id);
    setActiveAccount(account);

    // Fetch settings for new account
    const { data: settings } = await supabase
      .from('account_settings')
      .select('*')
      .eq('account_id', id)
      .maybeSingle();

    setAccountSettings(settings as AccountSettings | null);
  };

  return (
    <ActiveAccountContext.Provider value={{
      accounts,
      activeAccount,
      accountSettings,
      setActiveAccountId,
      loading,
      refetch: fetchAccounts,
    }}>
      {children}
    </ActiveAccountContext.Provider>
  );
}

export function useActiveAccount() {
  const context = useContext(ActiveAccountContext);
  if (context === undefined) {
    throw new Error('useActiveAccount must be used within an ActiveAccountProvider');
  }
  return context;
}
