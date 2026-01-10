-- ================================================================
-- RRE OS PRO v4 — Complete Database Schema
-- ================================================================

-- ENUMS
CREATE TYPE public.risk_profile AS ENUM ('conservative', 'normal', 'aggressive');
CREATE TYPE public.trade_mode AS ENUM ('assist', 'auto', 'safe');
CREATE TYPE public.trade_side AS ENUM ('buy', 'sell');
CREATE TYPE public.event_mode AS ENUM ('live', 'test', 'train');
CREATE TYPE public.candidate_type AS ENUM ('reclaim', 'retest', 'ladder');
CREATE TYPE public.candidate_status AS ENUM ('pending', 'executed', 'ignored', 'expired', 'blocked');
CREATE TYPE public.execution_status AS ENUM ('pending', 'sending', 'executed', 'rejected', 'failed');
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- ================================================================
-- USER ROLES TABLE (for secure role management)
-- ================================================================
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- RLS for user_roles
CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles"
  ON public.user_roles FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- ================================================================
-- PROFILES TABLE
-- ================================================================
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (NEW.id, NEW.raw_user_meta_data ->> 'display_name');
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ================================================================
-- ACCOUNTS TABLE
-- ================================================================
CREATE TABLE public.accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  label TEXT NOT NULL,
  risk_profile risk_profile NOT NULL DEFAULT 'normal',
  metaapi_account_id TEXT,
  is_demo BOOLEAN NOT NULL DEFAULT true,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own accounts"
  ON public.accounts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own accounts"
  ON public.accounts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own accounts"
  ON public.accounts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own accounts"
  ON public.accounts FOR DELETE
  USING (auth.uid() = user_id);

-- ================================================================
-- ACCOUNT SETTINGS TABLE
-- ================================================================
CREATE TABLE public.account_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID REFERENCES public.accounts(id) ON DELETE CASCADE NOT NULL UNIQUE,
  mode trade_mode NOT NULL DEFAULT 'assist',
  max_reentries_day INTEGER NOT NULL DEFAULT 3,
  cooldown_seconds INTEGER NOT NULL DEFAULT 300,
  max_daily_loss_pct DECIMAL(5,2) NOT NULL DEFAULT 2.00,
  loss_streak_lock_threshold INTEGER NOT NULL DEFAULT 3,
  lock_duration_minutes INTEGER NOT NULL DEFAULT 60,
  per_symbol_caps JSONB DEFAULT '{}',
  two_step_confirm_enabled BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.account_settings ENABLE ROW LEVEL SECURITY;

-- Helper function to get account owner
CREATE OR REPLACE FUNCTION public.get_account_owner(_account_id UUID)
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT user_id FROM public.accounts WHERE id = _account_id
$$;

CREATE POLICY "Users can view settings for their accounts"
  ON public.account_settings FOR SELECT
  USING (public.get_account_owner(account_id) = auth.uid());

CREATE POLICY "Users can update settings for their accounts"
  ON public.account_settings FOR UPDATE
  USING (public.get_account_owner(account_id) = auth.uid());

CREATE POLICY "Users can insert settings for their accounts"
  ON public.account_settings FOR INSERT
  WITH CHECK (public.get_account_owner(account_id) = auth.uid());

-- ================================================================
-- STOPOUT EVENTS TABLE
-- ================================================================
CREATE TABLE public.stopout_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  account_id UUID REFERENCES public.accounts(id) ON DELETE CASCADE NOT NULL,
  external_id TEXT UNIQUE,
  symbol TEXT NOT NULL,
  side trade_side NOT NULL,
  lots DECIMAL(10,2) NOT NULL,
  entry_price DECIMAL(20,5) NOT NULL,
  stop_price DECIMAL(20,5) NOT NULL,
  session_label TEXT,
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  mode event_mode NOT NULL DEFAULT 'live',
  source TEXT,
  payload_json JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.stopout_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own stopout events"
  ON public.stopout_events FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own stopout events"
  ON public.stopout_events FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ================================================================
-- REENTRY CANDIDATES TABLE
-- ================================================================
CREATE TABLE public.reentry_candidates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  account_id UUID REFERENCES public.accounts(id) ON DELETE CASCADE NOT NULL,
  event_id UUID REFERENCES public.stopout_events(id) ON DELETE CASCADE NOT NULL,
  candidate_type candidate_type NOT NULL,
  order_type TEXT NOT NULL DEFAULT 'limit',
  entry_price DECIMAL(20,5) NOT NULL,
  sl_price DECIMAL(20,5) NOT NULL,
  tp_price DECIMAL(20,5),
  rr_ratio DECIMAL(5,2),
  score DECIMAL(5,2),
  personal_confidence_score DECIMAL(5,2),
  score_tags TEXT[],
  strategy_tag TEXT,
  risk_flags_json JSONB DEFAULT '[]',
  metrics_json JSONB DEFAULT '{}',
  decision_rules_fired_json JSONB DEFAULT '[]',
  parallel_outcomes_json JSONB DEFAULT '{}',
  trust_context_json JSONB DEFAULT '{}',
  status candidate_status NOT NULL DEFAULT 'pending',
  blocked_reason TEXT,
  outcome_json JSONB,
  user_rating TEXT CHECK (user_rating IN ('good', 'neutral', 'bad')),
  user_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.reentry_candidates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own candidates"
  ON public.reentry_candidates FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own candidates"
  ON public.reentry_candidates FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own candidates"
  ON public.reentry_candidates FOR UPDATE
  USING (auth.uid() = user_id);

-- ================================================================
-- EXECUTIONS TABLE
-- ================================================================
CREATE TABLE public.executions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id UUID REFERENCES public.reentry_candidates(id) ON DELETE CASCADE NOT NULL,
  account_id UUID REFERENCES public.accounts(id) ON DELETE CASCADE NOT NULL,
  idempotency_key TEXT UNIQUE NOT NULL,
  broker TEXT,
  external_ticket TEXT,
  request_json JSONB,
  response_json JSONB,
  status execution_status NOT NULL DEFAULT 'pending',
  executed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.executions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view executions for their accounts"
  ON public.executions FOR SELECT
  USING (public.get_account_owner(account_id) = auth.uid());

CREATE POLICY "Users can create executions for their accounts"
  ON public.executions FOR INSERT
  WITH CHECK (public.get_account_owner(account_id) = auth.uid());

CREATE POLICY "Users can update executions for their accounts"
  ON public.executions FOR UPDATE
  USING (public.get_account_owner(account_id) = auth.uid());

-- ================================================================
-- DAILY METRICS TABLE
-- ================================================================
CREATE TABLE public.daily_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID REFERENCES public.accounts(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  realized_pnl DECIMAL(20,2) DEFAULT 0,
  realized_r DECIMAL(10,2) DEFAULT 0,
  max_drawdown DECIMAL(10,2) DEFAULT 0,
  loss_streak INTEGER DEFAULT 0,
  reentries_used INTEGER DEFAULT 0,
  locked_risk_mode BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (account_id, date)
);

ALTER TABLE public.daily_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view metrics for their accounts"
  ON public.daily_metrics FOR SELECT
  USING (public.get_account_owner(account_id) = auth.uid());

CREATE POLICY "Users can insert metrics for their accounts"
  ON public.daily_metrics FOR INSERT
  WITH CHECK (public.get_account_owner(account_id) = auth.uid());

CREATE POLICY "Users can update metrics for their accounts"
  ON public.daily_metrics FOR UPDATE
  USING (public.get_account_owner(account_id) = auth.uid());

-- ================================================================
-- ACCOUNT INSIGHTS TABLE
-- ================================================================
CREATE TABLE public.account_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID REFERENCES public.accounts(id) ON DELETE CASCADE NOT NULL UNIQUE,
  alpha_fingerprint_json JSONB DEFAULT '{}',
  best_symbols_json JSONB DEFAULT '[]',
  best_sessions_json JSONB DEFAULT '[]',
  best_candidate_types_json JSONB DEFAULT '[]',
  rr_band_stats_json JSONB DEFAULT '{}',
  avoid_conditions_json JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.account_insights ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view insights for their accounts"
  ON public.account_insights FOR SELECT
  USING (public.get_account_owner(account_id) = auth.uid());

CREATE POLICY "Users can update insights for their accounts"
  ON public.account_insights FOR UPDATE
  USING (public.get_account_owner(account_id) = auth.uid());

CREATE POLICY "Users can insert insights for their accounts"
  ON public.account_insights FOR INSERT
  WITH CHECK (public.get_account_owner(account_id) = auth.uid());

-- ================================================================
-- BEHAVIOR METRICS TABLE
-- ================================================================
CREATE TABLE public.behavior_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID REFERENCES public.accounts(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  evi_score DECIMAL(5,2) DEFAULT 50.00,
  trust_score DECIMAL(5,2) DEFAULT 50.00,
  override_count INTEGER DEFAULT 0,
  cooldown_violations INTEGER DEFAULT 0,
  revenge_tempo_score DECIMAL(5,2) DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (account_id, date)
);

ALTER TABLE public.behavior_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view behavior metrics for their accounts"
  ON public.behavior_metrics FOR SELECT
  USING (public.get_account_owner(account_id) = auth.uid());

CREATE POLICY "Users can insert behavior metrics for their accounts"
  ON public.behavior_metrics FOR INSERT
  WITH CHECK (public.get_account_owner(account_id) = auth.uid());

CREATE POLICY "Users can update behavior metrics for their accounts"
  ON public.behavior_metrics FOR UPDATE
  USING (public.get_account_owner(account_id) = auth.uid());

-- ================================================================
-- DECISION REPLAYS TABLE
-- ================================================================
CREATE TABLE public.decision_replays (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID REFERENCES public.accounts(id) ON DELETE CASCADE NOT NULL,
  candidate_id UUID REFERENCES public.reentry_candidates(id) ON DELETE CASCADE NOT NULL,
  timeline_json JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.decision_replays ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view replays for their accounts"
  ON public.decision_replays FOR SELECT
  USING (public.get_account_owner(account_id) = auth.uid());

CREATE POLICY "Users can insert replays for their accounts"
  ON public.decision_replays FOR INSERT
  WITH CHECK (public.get_account_owner(account_id) = auth.uid());

-- ================================================================
-- TRAINING RUNS TABLE
-- ================================================================
CREATE TABLE public.training_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID REFERENCES public.accounts(id) ON DELETE CASCADE NOT NULL,
  params_json JSONB NOT NULL DEFAULT '{}',
  results_json JSONB,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.training_runs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view training runs for their accounts"
  ON public.training_runs FOR SELECT
  USING (public.get_account_owner(account_id) = auth.uid());

CREATE POLICY "Users can create training runs for their accounts"
  ON public.training_runs FOR INSERT
  WITH CHECK (public.get_account_owner(account_id) = auth.uid());

CREATE POLICY "Users can update training runs for their accounts"
  ON public.training_runs FOR UPDATE
  USING (public.get_account_owner(account_id) = auth.uid());

-- ================================================================
-- AUDIT LOG TABLE
-- ================================================================
CREATE TABLE public.audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  account_id UUID REFERENCES public.accounts(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL,
  details_json JSONB DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own audit logs"
  ON public.audit_log FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own audit logs"
  ON public.audit_log FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Admins can view all audit logs
CREATE POLICY "Admins can view all audit logs"
  ON public.audit_log FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- ================================================================
-- KILL SWITCH TABLE
-- ================================================================
CREATE TABLE public.kill_switch (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID REFERENCES public.accounts(id) ON DELETE CASCADE NOT NULL UNIQUE,
  is_active BOOLEAN NOT NULL DEFAULT false,
  activated_by UUID REFERENCES auth.users(id),
  activated_at TIMESTAMPTZ,
  reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.kill_switch ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view kill switch for their accounts"
  ON public.kill_switch FOR SELECT
  USING (public.get_account_owner(account_id) = auth.uid());

CREATE POLICY "Users can manage kill switch for their accounts"
  ON public.kill_switch FOR ALL
  USING (public.get_account_owner(account_id) = auth.uid());

-- ================================================================
-- WEBHOOK SECRETS TABLE
-- ================================================================
CREATE TABLE public.webhook_secrets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID REFERENCES public.accounts(id) ON DELETE CASCADE NOT NULL,
  secret_hash TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.webhook_secrets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view webhook secrets for their accounts"
  ON public.webhook_secrets FOR SELECT
  USING (public.get_account_owner(account_id) = auth.uid());

CREATE POLICY "Users can manage webhook secrets for their accounts"
  ON public.webhook_secrets FOR ALL
  USING (public.get_account_owner(account_id) = auth.uid());

-- ================================================================
-- UPDATED_AT TRIGGER FUNCTION
-- ================================================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Apply updated_at triggers
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_accounts_updated_at
  BEFORE UPDATE ON public.accounts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_account_settings_updated_at
  BEFORE UPDATE ON public.account_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_reentry_candidates_updated_at
  BEFORE UPDATE ON public.reentry_candidates
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_daily_metrics_updated_at
  BEFORE UPDATE ON public.daily_metrics
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_account_insights_updated_at
  BEFORE UPDATE ON public.account_insights
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_behavior_metrics_updated_at
  BEFORE UPDATE ON public.behavior_metrics
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_kill_switch_updated_at
  BEFORE UPDATE ON public.kill_switch
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ================================================================
-- INDEXES FOR PERFORMANCE
-- ================================================================
CREATE INDEX idx_accounts_user_id ON public.accounts(user_id);
CREATE INDEX idx_stopout_events_user_id ON public.stopout_events(user_id);
CREATE INDEX idx_stopout_events_account_id ON public.stopout_events(account_id);
CREATE INDEX idx_stopout_events_occurred_at ON public.stopout_events(occurred_at DESC);
CREATE INDEX idx_reentry_candidates_event_id ON public.reentry_candidates(event_id);
CREATE INDEX idx_reentry_candidates_account_id ON public.reentry_candidates(account_id);
CREATE INDEX idx_reentry_candidates_status ON public.reentry_candidates(status);
CREATE INDEX idx_executions_candidate_id ON public.executions(candidate_id);
CREATE INDEX idx_daily_metrics_date ON public.daily_metrics(date DESC);
CREATE INDEX idx_behavior_metrics_date ON public.behavior_metrics(date DESC);
CREATE INDEX idx_audit_log_user_id ON public.audit_log(user_id);
CREATE INDEX idx_audit_log_created_at ON public.audit_log(created_at DESC);