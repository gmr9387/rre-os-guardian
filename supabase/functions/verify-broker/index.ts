import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface VerifyBrokerRequest {
  account_id: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } }
    );

    const { account_id }: VerifyBrokerRequest = await req.json();

    if (!account_id) {
      throw new Error('Missing account_id');
    }

    console.log(`[verify-broker] Checking broker connection for account ${account_id}`);

    // Fetch broker connection
    const { data: brokerConnection, error: brokerError } = await supabase
      .from('broker_connections')
      .select('*')
      .eq('account_id', account_id)
      .single();

    if (brokerError || !brokerConnection) {
      // Create default connection if missing
      const { data: newConnection, error: createError } = await supabase
        .from('broker_connections')
        .insert({
          account_id,
          broker: 'alpaca',
          environment: 'paper',
          status: 'disconnected',
          meta: { simulated: true },
        })
        .select()
        .single();

      if (createError) {
        throw new Error(`Failed to create broker connection: ${createError.message}`);
      }

      return new Response(
        JSON.stringify({
          success: true,
          status: 'disconnected',
          environment: 'paper',
          simulated: true,
          message: 'New broker connection created. Configure credentials to connect.',
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const environment = brokerConnection.environment;
    const meta = (brokerConnection.meta || {}) as Record<string, unknown>;

    // Simulation mode for MVP
    // In production, this would actually verify Alpaca API credentials
    let newStatus: string;
    let message: string;

    if (environment === 'paper') {
      // Paper trading always "connects" in simulation
      newStatus = 'connected';
      message = 'Paper trading connected (simulation mode)';
    } else {
      // Live mode requires real credentials (future implementation)
      const hasCredentials = meta.api_key_configured === true;
      if (hasCredentials) {
        // Would verify with Alpaca API here
        newStatus = 'connected';
        message = 'Live trading connected (simulation mode - credentials would be verified)';
      } else {
        newStatus = 'disconnected';
        message = 'Live trading requires API credentials. Configure in Settings → Broker.';
      }
    }

    // Update the connection status
    const { error: updateError } = await supabase
      .from('broker_connections')
      .update({
        status: newStatus,
        last_checked_at: new Date().toISOString(),
        meta: {
          ...meta,
          simulated: true,
          last_verification: new Date().toISOString(),
          last_check_result: newStatus === 'connected' ? 'success' : 'no_credentials',
        },
      })
      .eq('account_id', account_id);

    if (updateError) {
      console.error(`[verify-broker] Failed to update status:`, updateError);
    }

    console.log(`[verify-broker] Verification complete: ${newStatus}`);

    return new Response(
      JSON.stringify({
        success: true,
        status: newStatus,
        environment,
        simulated: true,
        message,
        last_checked_at: new Date().toISOString(),
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[verify-broker] Error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
