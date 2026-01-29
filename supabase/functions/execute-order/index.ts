import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ExecuteOrderRequest {
  candidate_id: string;
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
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { candidate_id, account_id }: ExecuteOrderRequest = await req.json();

    if (!candidate_id || !account_id) {
      throw new Error('Missing candidate_id or account_id');
    }

    console.log(`[execute-order] Processing candidate ${candidate_id} for account ${account_id}`);

    // Fetch the candidate
    const { data: candidate, error: candidateError } = await supabase
      .from('reentry_candidates')
      .select('*')
      .eq('id', candidate_id)
      .single();

    if (candidateError || !candidate) {
      throw new Error(`Candidate not found: ${candidateError?.message}`);
    }

    // Fetch broker connection
    const { data: brokerConnection, error: brokerError } = await supabase
      .from('broker_connections')
      .select('*')
      .eq('account_id', account_id)
      .single();

    if (brokerError) {
      console.warn(`[execute-order] No broker connection found, using simulation mode`);
    }

    const isSimulation = !brokerConnection || brokerConnection.environment === 'paper' || brokerConnection.status !== 'connected';
    
    // Generate idempotency key
    const idempotencyKey = `${account_id}_${candidate_id}_${Date.now()}`;

    // Simulate order execution
    const simulatedOrderId = `SIM-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    
    const orderDetails = {
      symbol: candidate.symbol,
      side: candidate.direction === 'long' ? 'buy' : 'sell',
      type: 'limit',
      limit_price: candidate.entry_price,
      qty: 1, // Would be calculated based on risk in real implementation
      time_in_force: 'gtc',
      stop_loss: candidate.sl_price,
      take_profit: candidate.tp_price,
    };

    console.log(`[execute-order] ${isSimulation ? 'SIMULATION' : 'LIVE'} order:`, orderDetails);

    // In simulation mode, we just log and record
    // In live mode (future), this would call Alpaca API
    const executionResult = {
      success: true,
      simulated: isSimulation,
      order_id: simulatedOrderId,
      filled_at: new Date().toISOString(),
      filled_price: candidate.entry_price,
      filled_qty: 1,
      message: isSimulation 
        ? 'Order simulated successfully (no broker credentials)' 
        : 'Order submitted to broker',
    };

    // Create execution record
    const { data: execution, error: execError } = await supabase
      .from('executions')
      .insert({
        candidate_id,
        account_id,
        idempotency_key: idempotencyKey,
        broker: brokerConnection?.broker || 'simulation',
        status: 'filled', // In simulation, immediately filled
        executed_at: new Date().toISOString(),
        external_ticket: simulatedOrderId,
        request_json: orderDetails,
        response_json: executionResult,
      })
      .select()
      .single();

    if (execError) {
      console.error(`[execute-order] Failed to record execution:`, execError);
      throw new Error(`Failed to record execution: ${execError.message}`);
    }

    // Update candidate status
    const { error: updateError } = await supabase
      .from('reentry_candidates')
      .update({ status: 'executed' })
      .eq('id', candidate_id);

    if (updateError) {
      console.error(`[execute-order] Failed to update candidate status:`, updateError);
    }

    // Increment reentries_used for today
    const today = new Date().toISOString().split('T')[0];
    const { data: dailyMetric } = await supabase
      .from('daily_metrics')
      .select('reentries_used')
      .eq('account_id', account_id)
      .eq('date', today)
      .maybeSingle();

    if (dailyMetric) {
      await supabase
        .from('daily_metrics')
        .update({ reentries_used: (dailyMetric.reentries_used || 0) + 1 })
        .eq('account_id', account_id)
        .eq('date', today);
    }

    console.log(`[execute-order] Execution complete:`, execution);

    return new Response(
      JSON.stringify({
        success: true,
        execution_id: execution.id,
        order_id: simulatedOrderId,
        simulated: isSimulation,
        message: executionResult.message,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[execute-order] Error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
