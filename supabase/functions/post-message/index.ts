// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
/// <reference types="https://esm.sh/@supabase/functions-js/src/edge-runtime.d.ts" />

import { fetchMessages, insertMessage } from "../_queries/messages.query.ts";
import { corsHeaders } from "../_utils/cors.ts";
import { createSupabaseClient } from "../_utils/supabase.ts";
import { MessageData } from "../_types/Database.type.ts";
import { fetchRoom, updateRoom } from "../_queries/room.query.ts";
import { isNotSystem } from "../_shared/utils.ts";

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

    const [messages, room] = await Promise.all([
      fetchMessages(supabase, message?.room_id),
      fetchRoom(supabase, message?.room_id),
    ]);

    if (!messages) throw new Error("No messages found");
    if (!room) throw new Error("No room found");
    if (room.status !== "talking") throw new Error("Room not talking");

    // trigger vote
    const numMessages = messages.filter(isNotSystem).length + 1;
    if (numMessages >= room.next_vote) {
      await updateRoom(supabase, room.id, {
        status: "voting",
      });
    }

    await insertMessage(supabase, message);

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
