// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
/// <reference types="https://esm.sh/@supabase/functions-js/src/edge-runtime.d.ts" />

import { insertMessage } from "../_queries/messages.query.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { createSupabaseClient } from "../_shared/supabase.ts";
import { MessageData } from "../_types/Database.type.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const message = (await req.json()) as Partial<MessageData>;
    if (!message?.content) throw new Error("Content is required");
    if (!message?.author) throw new Error("Author is required");

    const supabase = createSupabaseClient(req);

    insertMessage(supabase, message);

    const data = {};

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
