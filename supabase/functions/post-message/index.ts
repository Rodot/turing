// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
/// <reference types="https://esm.sh/@supabase/functions-js/src/edge-runtime.d.ts" />

import { fetchMessages, insertMessage } from "../_queries/messages.query.ts";
import { headers } from "../_utils/cors.ts";
import { createSupabaseClient } from "../_utils/supabase.ts";
import { MessageData } from "../_types/Database.type.ts";
import { fetchGameAndCheckStatus } from "../_queries/game.query.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers });
  }

  try {
    const message = (await req.json()) as Partial<MessageData>;

    if (!message?.game_id) throw new Error("Game ID is required");
    if (!message?.profile_id) throw new Error("Profile ID is required");
    if (!message?.content) throw new Error("Content is required");
    if (!message?.author_name) throw new Error("Author name is required");

    const supabase = createSupabaseClient(req);

    const [messages] = await Promise.all([
      fetchMessages(supabase, message?.game_id),
      fetchGameAndCheckStatus(supabase, message?.game_id, "talking"),
    ]);

    if (!messages) throw new Error("No messages found");

    await insertMessage(supabase, message);

    const data = JSON.stringify({});
    return new Response(data, { headers, status: 200 });
  } catch (error) {
    const data = JSON.stringify({ error });
    return new Response(data, { headers, status: 400 });
  }
});
