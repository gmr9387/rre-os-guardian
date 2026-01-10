import { supabase } from '@/integrations/supabase/client';

export async function bootstrapAccount(userId: string): Promise<string | null> {
  try {
    // Check if user already has accounts
    const { data: existingAccounts } = await supabase
      .from('accounts')
      .select('id')
      .eq('user_id', userId)
      .limit(1);

    if (existingAccounts && existingAccounts.length > 0) {
      return existingAccounts[0].id;
    }

    // Create default account
    const { data: account, error: accountError } = await supabase
      .from('accounts')
      .insert({
        user_id: userId,
        label: 'Personal',
        risk_profile: 'normal',
        is_demo: true,
        is_active: true,
      })
      .select()
      .single();

    if (accountError) throw accountError;

    const accountId = account.id;
    const today = new Date().toISOString().split('T')[0];

    // Create all related records in parallel
    await Promise.all([
      // Account settings
      supabase.from('account_settings').insert({
        account_id: accountId,
        mode: 'assist',
        max_reentries_day: 3,
        cooldown_seconds: 300,
        max_daily_loss_pct: 2.0,
        loss_streak_lock_threshold: 3,
        lock_duration_minutes: 60,
        per_symbol_caps: {},
        two_step_confirm_enabled: false,
      }),

      // Kill switch
      supabase.from('kill_switch').insert({
        account_id: accountId,
        is_active: false,
      }),

      // Account insights
      supabase.from('account_insights').insert({
        account_id: accountId,
        alpha_fingerprint_json: {},
        best_symbols_json: [],
        best_sessions_json: [],
        best_candidate_types_json: [],
        rr_band_stats_json: {},
        avoid_conditions_json: [],
      }),

      // Daily metrics for today
      supabase.from('daily_metrics').insert({
        account_id: accountId,
        date: today,
        realized_pnl: 0,
        realized_r: 0,
        max_drawdown: 0,
        loss_streak: 0,
        reentries_used: 0,
        locked_risk_mode: false,
      }),

      // Behavior metrics for today
      supabase.from('behavior_metrics').insert({
        account_id: accountId,
        date: today,
        evi_score: 50,
        trust_score: 50,
        override_count: 0,
        cooldown_violations: 0,
        revenge_tempo_score: 0,
      }),
    ]);

    return accountId;
  } catch (error) {
    console.error('Error bootstrapping account:', error);
    return null;
  }
}
