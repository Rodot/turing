// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
/// <reference types="https://esm.sh/@supabase/functions-js@2.4.4/src/edge-runtime.d.ts" />

import { fetchMessages } from "../_queries/messages.query.ts";
import { corsHeaders } from "../_utils/cors.ts";
import { createSupabaseClient } from "../_utils/supabase.ts";
import { fetchChatCompletionJson } from "../_queries/gpt.query.ts";
import { promptForNextMessageSuggestions } from "../_utils/prompts.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { roomId, playerName, lang } = await req.json();
    if (!roomId) throw new Error("Missing roomId");
    if (!playerName) throw new Error("Missing playerName");
    if (!lang) throw new Error("Missing lang");
    if (lang !== "fr" && lang !== "en") throw new Error("Invalid lang");

    const supabase = createSupabaseClient(req);

    const messagesData = await fetchMessages(supabase, roomId);

    const messages = promptForNextMessageSuggestions(
      playerName,
      messagesData,
      lang,
    );

    const gptAnswer = await fetchChatCompletionJson(messages);

    const data = gptAnswer;

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
