-- Add risk_per_trade_pct column to account_settings for dynamic position sizing
ALTER TABLE public.account_settings 
ADD COLUMN IF NOT EXISTS risk_per_trade_pct numeric NOT NULL DEFAULT 1.0;

-- Add comment for documentation
COMMENT ON COLUMN public.account_settings.risk_per_trade_pct IS 'Percentage of account to risk per trade (1.0 = 1%)';

-- Enable realtime for candidates and executions tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.reentry_candidates;
ALTER PUBLICATION supabase_realtime ADD TABLE public.executions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.stopout_events;