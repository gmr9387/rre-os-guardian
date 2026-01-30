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

    // Fetch the candidate with stopout event data (for symbol and side)
    const { data: candidate, error: candidateError } = await supabase
      .from('reentry_candidates')
      .select('*, stopout_event:stopout_events(*)')
      .eq('id', candidate_id)
      .single();

    if (candidateError || !candidate) {
      throw new Error(`Candidate not found: ${candidateError?.message}`);
    }

    // Extract symbol and direction from stopout event
    const symbol = candidate.stopout_event?.symbol;
    const direction = candidate.stopout_event?.side === 'buy' ? 'long' : 'short';

    if (!symbol) {
      throw new Error('Symbol not found for candidate');
    }

    console.log(`[execute-order] Candidate: ${symbol} ${direction} @ ${candidate.entry_price}`);

    // Fetch broker connection
    const { data: brokerConnection, error: brokerError } = await supabase
      .from('broker_connections')
      .select('*')
      .eq('account_id', account_id)
      .single();

    // Fetch account settings for position sizing
    const { data: accountSettings } = await supabase
      .from('account_settings')
      .select('risk_per_trade_pct')
      .eq('account_id', account_id)
      .single();

    const riskPerTradePct = accountSettings?.risk_per_trade_pct || 1.0;

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
    console.log(`[execute-order] Risk per trade: ${riskPerTradePct}%`);

    // Calculate dynamic position size
    let calculatedQty = 1;
    
    if (useAlpaca && hasAlpacaCredentials) {
      try {
        // Fetch account balance from Alpaca
        const baseUrl = isPaperMode ? 'https://paper-api.alpaca.markets' : 'https://api.alpaca.markets';
        const accountResponse = await fetch(`${baseUrl}/v2/account`, {
          headers: {
            'APCA-API-KEY-ID': alpacaApiKey!,
            'APCA-API-SECRET-KEY': alpacaSecretKey!,
          },
        });
        
        if (accountResponse.ok) {
          const alpacaAccount = await accountResponse.json();
          const equity = parseFloat(alpacaAccount.equity);
          const riskAmount = equity * (riskPerTradePct / 100);
          const stopDistance = Math.abs(candidate.entry_price - candidate.sl_price);
          
          if (stopDistance > 0) {
            // For stocks: qty = risk$ / (stopDistance * sharePrice)
            // Simplified: assume entry price ≈ share price
            calculatedQty = Math.floor(riskAmount / stopDistance);
            calculatedQty = Math.max(1, calculatedQty); // At least 1 share
            console.log(`[execute-order] Dynamic sizing: equity=$${equity.toFixed(2)}, risk=$${riskAmount.toFixed(2)}, qty=${calculatedQty}`);
          }
        } else {
          console.warn(`[execute-order] Could not fetch Alpaca account, using default qty=1`);
        }
      } catch (e) {
        console.warn(`[execute-order] Position sizing error:`, e);
      }
    }

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
      symbol: symbol,
      side: direction === 'long' ? 'buy' : 'sell',
      type: 'limit',
      limit_price: candidate.entry_price,
      qty: calculatedQty,
      time_in_force: 'gtc',
      stop_loss: candidate.sl_price,
      take_profit: candidate.tp_price,
      risk_per_trade_pct: riskPerTradePct,
    };

    if (useAlpaca) {
      // Real Alpaca API call with bracket order
      console.log(`[execute-order] Placing LIVE order via Alpaca Paper Trading`);
      
      try {
        const alpacaOrder = await placeAlpacaOrder(
          alpacaApiKey!,
          alpacaSecretKey!,
          {
            symbol: symbol,
            qty: calculatedQty,
            side: direction === 'long' ? 'buy' : 'sell',
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
          filled_qty: calculatedQty,
          message: `Bracket order submitted to Alpaca (${alpacaOrder.status}) - ${calculatedQty} shares`,
          alpaca_response: alpacaOrder,
        };

        console.log(`[execute-order] Alpaca order placed successfully: ${alpacaOrder.id}`);
      } catch (alpacaError) {
        console.warn(`[execute-order] Alpaca API error, falling back to simulation:`, alpacaError);
        
        // Fall back to simulation mode when Alpaca fails (e.g., unsupported symbols like forex)
        const simulatedOrderId = `SIM-FALLBACK-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
        
        executionResult = {
          success: true,
          simulated: true,
          order_id: simulatedOrderId,
          filled_at: new Date().toISOString(),
          filled_price: candidate.entry_price,
          filled_qty: calculatedQty,
          message: `Alpaca unavailable for ${symbol}, simulated execution (${calculatedQty} units)`,
        };
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
        filled_qty: calculatedQty,
        message: hasAlpacaCredentials 
          ? `Order simulated (${calculatedQty} units, live mode not enabled)` 
          : `Order simulated (${calculatedQty} units, no Alpaca credentials)`,
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
        status: executionResult.simulated ? 'executed' : 'pending', // Simulated orders are immediately executed, Alpaca orders start as pending
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
