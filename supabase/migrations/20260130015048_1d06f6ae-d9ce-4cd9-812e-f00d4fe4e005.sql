-- Add execution_mode column to account_settings
-- 'auto' = Direct execution via Alpaca API
-- 'manual' = Manual signals mode (user executes trades themselves)
ALTER TABLE public.account_settings 
ADD COLUMN execution_mode text NOT NULL DEFAULT 'auto' 
CHECK (execution_mode IN ('auto', 'manual'));