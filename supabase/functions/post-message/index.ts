// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
/// <reference types="https://esm.sh/@supabase/functions-js/src/edge-runtime.d.ts" />

import { fetchMessages, insertMessage } from "../_queries/messages.query.ts";
import { nextChatTurn } from "../_utils/chat.ts";
import { corsHeaders } from "../_utils/cors.ts";
import { createSupabaseClient } from "../_utils/supabase.ts";
import { MessageData } from "../_types/Database.type.ts";
import { triggerVoteIfNeeded } from "../_utils/vote.ts";
import { fetchPlayers } from "../_queries/players.query.ts";
import { fetchRoom } from "../_queries/room.query.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const message = (await req.json()) as Partial<MessageData>;
    if (!message?.room_id) throw new Error("Room ID is required");
    if (!message?.player_id) throw new Error("Player ID is required");
    if (!message?.user_id) throw new Error("User ID is required");
    if (!message?.content) throw new Error("Content is required");
    if (!message?.author) throw new Error("Author is required");

    const supabase = createSupabaseClient(req);

    const players = await fetchPlayers(supabase, message?.room_id);
    const messages = await fetchMessages(supabase, message?.room_id);
    const room = await fetchRoom(supabase, message?.room_id);
    if (!players?.length) throw new Error("No players found");
    if (!messages) throw new Error("No messages found");
    if (!room) throw new Error("No room found");

    await insertMessage(supabase, message);

    if (await triggerVoteIfNeeded(supabase, room, messages)) return;

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
