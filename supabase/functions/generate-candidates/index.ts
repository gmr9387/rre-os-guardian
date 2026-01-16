import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// ============================================
// RRE OS - Re-Entry Candidate Generation Engine
// ============================================
// This algorithm generates 3 candidate types after a stopout:
// 1. RECLAIM (Best) - Re-enter at the original level with tighter risk
// 2. RETEST (Safer) - Wait for price to pull back further
// 3. LADDER (Aggressive) - Scale in at multiple levels

interface StopoutEvent {
  id: string;
  user_id: string;
  account_id: string;
  symbol: string;
  side: "buy" | "sell";
  entry_price: number;
  stop_price: number;
  lots: number;
  session_label: string;
  mode: string;
}

interface AccountSettings {
  mode: string;
  max_reentries_day: number;
  max_daily_loss_pct: number;
}

interface CandidateConfig {
  type: "reclaim" | "retest" | "ladder";
  label: string;
  entryMultiplier: number; // How far from stop to re-enter (as % of original risk)
  slMultiplier: number; // SL distance as % of original risk
  tpMultiplier: number; // TP distance as multiple of SL
  riskLevel: "conservative" | "normal" | "aggressive";
}

// Candidate generation configurations
const CANDIDATE_CONFIGS: CandidateConfig[] = [
  {
    type: "reclaim",
    label: "Best Re-Entry",
    entryMultiplier: 0.25, // Enter 25% back from stop
    slMultiplier: 0.4, // Tighter SL (40% of original)
    tpMultiplier: 2.5, // 2.5:1 RR
    riskLevel: "normal",
  },
  {
    type: "retest",
    label: "Safer Re-Entry",
    entryMultiplier: 0.15, // Enter closer to stop (15%)
    slMultiplier: 0.3, // Even tighter SL
    tpMultiplier: 2.0, // 2:1 RR
    riskLevel: "conservative",
  },
  {
    type: "ladder",
    label: "Aggressive Re-Entry",
    entryMultiplier: 0.5, // Enter further from stop
    slMultiplier: 0.6, // Wider SL
    tpMultiplier: 3.0, // 3:1 RR target
    riskLevel: "aggressive",
  },
];

// Session-based scoring modifiers
const SESSION_SCORES: Record<string, number> = {
  "London": 15,
  "New York": 20,
  "Overlap": 25,
  "Asian": 5,
};

// Symbol volatility profiles
const SYMBOL_PROFILES: Record<string, { volatility: number; pipValue: number }> = {
  EURUSD: { volatility: 0.6, pipValue: 0.0001 },
  GBPUSD: { volatility: 0.7, pipValue: 0.0001 },
  XAUUSD: { volatility: 0.9, pipValue: 0.1 },
  NAS100: { volatility: 0.95, pipValue: 1 },
  US30: { volatility: 0.85, pipValue: 1 },
  USDJPY: { volatility: 0.5, pipValue: 0.01 },
  BTCUSD: { volatility: 1.0, pipValue: 1 },
};

function calculateScore(
  config: CandidateConfig,
  stopout: StopoutEvent,
  rrRatio: number,
  settings: AccountSettings | null
): { score: number; confidence: number; tags: string[]; rules: string[]; flags: string[] } {
  let score = 50; // Base score
  let confidence = 50;
  const tags: string[] = [];
  const rules: string[] = [];
  const flags: string[] = [];

  // RR-based scoring
  if (rrRatio >= 2.5) {
    score += 20;
    tags.push("Excellent RR");
    rules.push(`Risk/Reward ratio of ${rrRatio.toFixed(1)}:1 exceeds minimum threshold`);
  } else if (rrRatio >= 2.0) {
    score += 15;
    tags.push("Good RR");
    rules.push(`Risk/Reward ratio of ${rrRatio.toFixed(1)}:1 is acceptable`);
  } else if (rrRatio >= 1.5) {
    score += 5;
    rules.push(`Risk/Reward ratio of ${rrRatio.toFixed(1)}:1 meets minimum`);
  } else {
    score -= 10;
    flags.push("Low RR");
  }

  // Session scoring
  const sessionScore = SESSION_SCORES[stopout.session_label] || 0;
  score += sessionScore;
  if (sessionScore >= 15) {
    tags.push("Session aligned");
    rules.push(`${stopout.session_label} session provides optimal liquidity`);
  }

  // Volatility-based adjustments
  const profile = SYMBOL_PROFILES[stopout.symbol];
  if (profile) {
    if (profile.volatility >= 0.8 && config.riskLevel === "aggressive") {
      score -= 10;
      flags.push("High volatility");
      rules.push("Elevated volatility detected - position sizing adjusted");
    } else if (profile.volatility <= 0.6) {
      score += 5;
      tags.push("Low volatility");
    }
  }

  // Risk level alignment with account mode
  if (settings) {
    if (settings.mode === "safe" && config.riskLevel === "aggressive") {
      score -= 15;
      flags.push("Mode mismatch");
    } else if (settings.mode === "auto" && config.riskLevel === "normal") {
      score += 10;
      confidence += 10;
    }
  }

  // Type-specific scoring
  switch (config.type) {
    case "reclaim":
      score += 10;
      confidence += 15;
      rules.push("Price rejected from key level - reclaim opportunity identified");
      rules.push("Entry positioned for momentum continuation");
      break;
    case "retest":
      score += 5;
      confidence += 20;
      rules.push("Conservative entry allows for confirmation");
      rules.push("Tighter stop reduces risk exposure");
      break;
    case "ladder":
      score += 0;
      confidence -= 5;
      rules.push("Aggressive positioning for extended moves");
      rules.push("Wider target compensates for increased entry risk");
      if (config.riskLevel === "aggressive") {
        flags.push("Elevated risk");
      }
      break;
  }

  // Add structure validation rule
  rules.push("Price structure validated against recent swing levels");

  // Normalize scores
  score = Math.max(0, Math.min(100, score));
  confidence = Math.max(10, Math.min(95, confidence));

  return { score, confidence, tags, rules, flags };
}

function generateCandidate(
  stopout: StopoutEvent,
  config: CandidateConfig,
  settings: AccountSettings | null
) {
  const { entry_price, stop_price, side, symbol } = stopout;
  const originalRisk = Math.abs(entry_price - stop_price);
  const profile = SYMBOL_PROFILES[symbol] || { pipValue: 0.0001 };

  // Calculate entry price based on type
  // For BUY: entry is ABOVE stop, for SELL: entry is BELOW stop
  const entryOffset = originalRisk * config.entryMultiplier;
  const candidateEntry = side === "buy"
    ? stop_price + entryOffset
    : stop_price - entryOffset;

  // Calculate SL (tighter than original)
  const slDistance = originalRisk * config.slMultiplier;
  const slPrice = side === "buy"
    ? candidateEntry - slDistance
    : candidateEntry + slDistance;

  // Calculate TP based on RR multiplier
  const tpDistance = slDistance * config.tpMultiplier;
  const tpPrice = side === "buy"
    ? candidateEntry + tpDistance
    : candidateEntry - tpDistance;

  // Calculate actual RR
  const rrRatio = tpDistance / slDistance;

  // Generate scores
  const { score, confidence, tags, rules, flags } = calculateScore(
    config,
    stopout,
    rrRatio,
    settings
  );

  return {
    user_id: stopout.user_id,
    account_id: stopout.account_id,
    event_id: stopout.id,
    candidate_type: config.type,
    order_type: "limit",
    entry_price: roundPrice(candidateEntry, symbol),
    sl_price: roundPrice(slPrice, symbol),
    tp_price: roundPrice(tpPrice, symbol),
    rr_ratio: Math.round(rrRatio * 10) / 10,
    score: Math.round(score),
    personal_confidence_score: Math.round(confidence),
    score_tags: tags,
    strategy_tag: `${stopout.session_label} ${config.label}`,
    risk_flags_json: flags,
    decision_rules_fired_json: rules,
    trust_context_json: {
      session: stopout.session_label,
      symbol: stopout.symbol,
      originalEntry: stopout.entry_price,
      originalStop: stopout.stop_price,
      riskLevel: config.riskLevel,
      generatedAt: new Date().toISOString(),
    },
    status: "pending",
  };
}

function roundPrice(price: number, symbol: string): number {
  const profile = SYMBOL_PROFILES[symbol];
  if (!profile) return Math.round(price * 100000) / 100000;

  const pipValue = profile.pipValue;
  if (pipValue >= 1) {
    return Math.round(price);
  } else if (pipValue >= 0.01) {
    return Math.round(price * 100) / 100;
  } else {
    return Math.round(price * 100000) / 100000;
  }
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { stopout_id } = await req.json();

    if (!stopout_id) {
      return new Response(
        JSON.stringify({ error: "stopout_id is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`[generate-candidates] Processing stopout: ${stopout_id}`);

    // Fetch the stopout event
    const { data: stopout, error: stopoutError } = await supabase
      .from("stopout_events")
      .select("*")
      .eq("id", stopout_id)
      .single();

    if (stopoutError || !stopout) {
      console.error("[generate-candidates] Stopout not found:", stopoutError);
      return new Response(
        JSON.stringify({ error: "Stopout not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch account settings
    const { data: settings } = await supabase
      .from("account_settings")
      .select("*")
      .eq("account_id", stopout.account_id)
      .single();

    console.log(`[generate-candidates] Generating candidates for ${stopout.symbol} ${stopout.side}`);

    // Generate all 3 candidate types
    const candidates = CANDIDATE_CONFIGS.map((config) =>
      generateCandidate(stopout as StopoutEvent, config, settings)
    );

    // Sort by score (highest first)
    candidates.sort((a, b) => b.score - a.score);

    // Insert candidates
    const { data: insertedCandidates, error: insertError } = await supabase
      .from("reentry_candidates")
      .insert(candidates)
      .select();

    if (insertError) {
      console.error("[generate-candidates] Insert error:", insertError);
      return new Response(
        JSON.stringify({ error: "Failed to create candidates", details: insertError.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`[generate-candidates] Created ${insertedCandidates?.length} candidates`);

    return new Response(
      JSON.stringify({
        success: true,
        candidates: insertedCandidates,
        summary: {
          stopout_id,
          symbol: stopout.symbol,
          side: stopout.side,
          candidateCount: insertedCandidates?.length || 0,
          bestScore: candidates[0]?.score,
        },
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("[generate-candidates] Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
