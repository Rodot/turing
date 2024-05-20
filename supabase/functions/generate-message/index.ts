// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
/// <reference types="https://esm.sh/@supabase/functions-js/src/edge-runtime.d.ts" />

import { corsHeaders } from "../_shared/cors.ts";
import { fetchChatCompletionJson } from "../_queries/gpt.query.ts";
import { fetchMessages, insertMessage } from "../_queries/messages.query.ts";
import { createSupabaseClient } from "../_shared/supabase.ts";
import { fetchPlayers } from "../_queries/players.query.ts";
import { promptForNextMessage } from "../_shared/prompts.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { roomId } = await req.json();
    if (!roomId) {
      throw new Error("Missing roomId");
    }

    const supabase = createSupabaseClient(req);

    const players = await fetchPlayers(supabase, roomId);
    const messagesData = await fetchMessages(supabase, roomId);

    const allBots = players.filter((player) => !player.user_id);
    const livingBots = allBots.filter((player) => !player.is_dead);
    if (!livingBots.length) {
      throw new Error("No living bots in the room");
    }

    const randomLivingBot =
      livingBots[Math.floor(Math.random() * livingBots.length)];

    const messages = promptForNextMessage(randomLivingBot.name, messagesData);

    const gptAnswer = await fetchChatCompletionJson(messages);

    await insertMessage(supabase, {
      author: randomLivingBot.name,
      room_id: roomId,
      content: gptAnswer.message.toLowerCase(),
    });

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
