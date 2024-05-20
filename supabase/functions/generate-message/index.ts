// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
/// <reference types="https://esm.sh/@supabase/functions-js/src/edge-runtime.d.ts" />

import { MessageData } from "../_types/Database.type.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { fetchChatCompletionJson } from "../_queries/gpt.query.ts";
import { fetchMessages, insertMessage } from "../_queries/messages.query.ts";
import { createSupabaseClient } from "../_shared/supabase.ts";
import { fetchPlayers } from "../_queries/players.query.ts";

const messagesToPrompt = (messages: Array<MessageData>) =>
  messages.map((message) => ({
    participant: message.author,
    message: message.content,
  }));

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

    const randomBot = livingBots[Math.floor(Math.random() * livingBots.length)];

    const systemPrompt = `You are not an AI. You are ${randomBot.name}, a 14 years old filthy teenager. You will be provided a chat history. It's an informal group conversation on whatsapp. You usually speak in short answers, use slangs, have a broken english like a foreigner who's learning, and do a least one grammar mistake or typo per answer. You don't use emojis. ${randomBot.name}, what will be your next message ? Only include a single message as a JSON object without the list, so it can be appended to the existing list.`;

    const messages = [
      {
        role: "system",
        content: systemPrompt,
      },
      {
        role: "user",
        content: JSON.stringify(messagesToPrompt(messagesData)),
      },
    ];

    const gptAnswer = await fetchChatCompletionJson(messages);

    await insertMessage(supabase, {
      author: randomBot.name,
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
