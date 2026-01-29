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

interface AlpacaOrderResponse {
  id: string;
  client_order_id: string;
  status: string;
  symbol: string;
  qty: string;
  side: string;
  type: string;
  time_in_force: string;
  limit_price?: string;
  stop_price?: string;
  filled_qty?: string;
  filled_avg_price?: string;
  created_at: string;
  submitted_at: string;
  order_class?: string;
  legs?: AlpacaOrderResponse[];
}

async function placeAlpacaOrder(
  apiKey: string,
  secretKey: string,
  orderRequest: {
    symbol: string;
    qty: number;
    side: 'buy' | 'sell';
    type: 'limit' | 'market' | 'stop' | 'stop_limit';
    time_in_force: 'day' | 'gtc' | 'opg' | 'cls' | 'ioc' | 'fok';
    limit_price?: number;
    stop_price?: number;
    order_class?: 'simple' | 'bracket' | 'oco' | 'oto';
    take_profit?: { limit_price: number };
    stop_loss?: { stop_price: number; limit_price?: number };
  }
): Promise<AlpacaOrderResponse> {
  const baseUrl = 'https://paper-api.alpaca.markets';
  
  console.log(`[Alpaca] Placing order:`, JSON.stringify(orderRequest, null, 2));
  
  const response = await fetch(`${baseUrl}/v2/orders`, {
    method: 'POST',
    headers: {
      'APCA-API-KEY-ID': apiKey,
      'APCA-API-SECRET-KEY': secretKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(orderRequest),
  });

  const responseText = await response.text();
  console.log(`[Alpaca] Response status: ${response.status}`);
  console.log(`[Alpaca] Response body: ${responseText}`);

  if (!response.ok) {
    throw new Error(`Alpaca API error (${response.status}): ${responseText}`);
  }

  return JSON.parse(responseText);
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

    // Check for Alpaca API credentials
    const alpacaApiKey = Deno.env.get('ALPACA_API_KEY');
    const alpacaSecretKey = Deno.env.get('ALPACA_SECRET_KEY');
    
    const hasAlpacaCredentials = alpacaApiKey && alpacaSecretKey;
    const isPaperMode = !brokerConnection || brokerConnection.environment === 'paper';
    
    // Determine if we should use live Alpaca or simulation
    const useAlpaca = hasAlpacaCredentials && isPaperMode;
    
    console.log(`[execute-order] Alpaca credentials: ${hasAlpacaCredentials ? 'YES' : 'NO'}`);
    console.log(`[execute-order] Paper mode: ${isPaperMode}`);
    console.log(`[execute-order] Using Alpaca: ${useAlpaca}`);

    // Generate idempotency key
    const idempotencyKey = `${account_id}_${candidate_id}_${Date.now()}`;

    let executionResult: {
      success: boolean;
      simulated: boolean;
      order_id: string;
      filled_at: string;
      filled_price: number;
      filled_qty: number;
      message: string;
      alpaca_response?: AlpacaOrderResponse;
    };

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

    if (useAlpaca) {
      // Real Alpaca API call with bracket order
      console.log(`[execute-order] Placing LIVE order via Alpaca Paper Trading`);
      
      try {
        const alpacaOrder = await placeAlpacaOrder(
          alpacaApiKey!,
          alpacaSecretKey!,
          {
            symbol: candidate.symbol,
            qty: 1,
            side: candidate.direction === 'long' ? 'buy' : 'sell',
            type: 'limit',
            time_in_force: 'gtc',
            limit_price: candidate.entry_price,
            order_class: 'bracket',
            take_profit: {
              limit_price: candidate.tp_price,
            },
            stop_loss: {
              stop_price: candidate.sl_price,
            },
          }
        );

        executionResult = {
          success: true,
          simulated: false,
          order_id: alpacaOrder.id,
          filled_at: alpacaOrder.submitted_at,
          filled_price: candidate.entry_price,
          filled_qty: 1,
          message: `Bracket order submitted to Alpaca (${alpacaOrder.status})`,
          alpaca_response: alpacaOrder,
        };

        console.log(`[execute-order] Alpaca order placed successfully: ${alpacaOrder.id}`);
      } catch (alpacaError) {
        console.error(`[execute-order] Alpaca API error:`, alpacaError);
        throw new Error(`Alpaca order failed: ${alpacaError instanceof Error ? alpacaError.message : 'Unknown error'}`);
      }
    } else {
      // Simulation mode fallback
      console.log(`[execute-order] Using SIMULATION mode`);
      const simulatedOrderId = `SIM-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
      
      executionResult = {
        success: true,
        simulated: true,
        order_id: simulatedOrderId,
        filled_at: new Date().toISOString(),
        filled_price: candidate.entry_price,
        filled_qty: 1,
        message: hasAlpacaCredentials 
          ? 'Order simulated (live mode not enabled)' 
          : 'Order simulated (no Alpaca credentials configured)',
      };
    }

    // Create execution record
    const { data: execution, error: execError } = await supabase
      .from('executions')
      .insert({
        candidate_id,
        account_id,
        idempotency_key: idempotencyKey,
        broker: useAlpaca ? 'alpaca' : 'simulation',
        status: executionResult.simulated ? 'filled' : 'pending', // Alpaca orders start as pending
        executed_at: new Date().toISOString(),
        external_ticket: executionResult.order_id,
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
        order_id: executionResult.order_id,
        simulated: executionResult.simulated,
        message: executionResult.message,
        alpaca_status: executionResult.alpaca_response?.status,
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
