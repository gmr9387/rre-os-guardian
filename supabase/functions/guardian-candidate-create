// supabase/functions/guardian-candidate-create/index.ts
// Guardian Backend — Candidate Creation (Generation 1)
//
// Purpose:
//   Create a new re-entry candidate after a stopout or signal.
//   This is the FIRST step in the Guardian pipeline.
//
// Input:
//   {
//     account_id: string,
//     symbol: string,
//     side: "buy" | "sell",
//     stopout_id?: string,
//     type?: "reclaim" | "retest" | "ladder",
//     mode?: "assist" | "auto" | "safe" | "live" | "test" | "train",
//     risk?: "conservative" | "normal" | "aggressive"
//   }
//
// Output:
//   {
//     status: "candidate-created",
//     candidate_id: string
//   }

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

serve(async (req) => {
  try {
    const body = await req.json();

    const {
      account_id,
      symbol,
      side,
      stopout_id = null,
      type = "reclaim",
      mode = "assist",
      risk = "normal",
    } = body;

    if (!account_id || !symbol || !side) {
      return new Response(
        JSON.stringify({
          error: "missing-required-fields",
          required: ["account_id", "symbol", "side"],
        }),
        { status: 400 }
      );
    }

    // Insert candidate
    const { data, error } = await supabase
      .from("guardian_candidates")
      .insert({
        account_id,
        symbol,
        side,
        type,
        mode,
        risk,
        status: "pending",
        stopout_id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select("id")
      .single();

    if (error) {
      return new Response(
        JSON.stringify({
          error: "candidate-create-failed",
          details: error.message,
        }),
        { status: 500 }
      );
    }

    return new Response(
      JSON.stringify({
        status: "candidate-created",
        candidate_id: data.id,
      }),
      { status: 200 }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({
        error: "invalid-json",
        details: String(err),
      }),
      { status: 400 }
    );
  }
});
