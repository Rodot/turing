// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
/// <reference types="https://esm.sh/@supabase/functions-js/src/edge-runtime.d.ts" />

import { fetchMessages, insertMessage } from "../_queries/messages.query.ts";
import { headers } from "../_utils/cors.ts";
import { createSupabaseClient } from "../_utils/supabase.ts";
import { MessageData } from "../_types/Database.type.ts";
import { fetchGame, updateGame } from "../_queries/game.query.ts";
import { isNotSystem } from "../_shared/utils.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers });
  }

  try {
    const message = (await req.json()) as Partial<MessageData>;

    if (!message?.game_id) throw new Error("Game ID is required");
    if (!message?.player_id) throw new Error("Player ID is required");
    if (!message?.user_id) throw new Error("User ID is required");
    if (!message?.content) throw new Error("Content is required");
    if (!message?.author) throw new Error("Author is required");

    const supabase = createSupabaseClient(req);

    const [messages, game] = await Promise.all([
      fetchMessages(supabase, message?.game_id),
      fetchGame(supabase, message?.game_id),
    ]);

    if (!messages) throw new Error("No messages found");
    if (!game) throw new Error("No game found");
    if (game.status !== "talking") throw new Error("Game not talking");

    // trigger vote
    const numMessages = messages.filter(isNotSystem).length + 1;
    if (numMessages >= game.next_vote) {
      await updateGame(supabase, game.id, {
        status: "voting",
      });
    }

    await insertMessage(supabase, message);

    const data = JSON.stringify({});
    return new Response(data, { headers, status: 200 });
  } catch (error) {
    const data = JSON.stringify({ error });
    return new Response(data, { headers, status: 400 });
  }
});
