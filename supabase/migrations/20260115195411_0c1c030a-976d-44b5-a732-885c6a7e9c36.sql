-- Create broker_connections table
CREATE TABLE public.broker_connections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  account_id UUID NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE UNIQUE,
  broker TEXT NOT NULL DEFAULT 'alpaca',
  environment TEXT NOT NULL DEFAULT 'paper',
  status TEXT NOT NULL DEFAULT 'disconnected',
  last_checked_at TIMESTAMP WITH TIME ZONE,
  meta JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.broker_connections ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view broker connections for their accounts"
ON public.broker_connections
FOR SELECT
USING (get_account_owner(account_id) = auth.uid());

CREATE POLICY "Users can insert broker connections for their accounts"
ON public.broker_connections
FOR INSERT
WITH CHECK (get_account_owner(account_id) = auth.uid());

CREATE POLICY "Users can update broker connections for their accounts"
ON public.broker_connections
FOR UPDATE
USING (get_account_owner(account_id) = auth.uid());

-- Add update trigger for updated_at
CREATE TRIGGER update_broker_connections_updated_at
BEFORE UPDATE ON public.broker_connections
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();