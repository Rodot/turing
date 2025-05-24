// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
/// <reference types="https://esm.sh/@supabase/functions-js/src/edge-runtime.d.ts" />

import {
  fetchGameAndCheckStatus,
  updateAllPlayersInGame,
  updateGameWithStatusTransition,
} from "../_queries/game.query.ts";
import { headers } from "../_utils/cors.ts";
import { createSupabaseClient } from "../_utils/supabase.ts";
import { createErrorResponse } from "../_utils/error.ts";
import {
  postIcebreakerMessage,
  fetchMessages,
} from "../_queries/messages.query.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers });
  }

  try {
    const { gameId }: { gameId: string } = await req.json();
    if (!gameId) throw new Error("Missing gameId");
    const supabase = createSupabaseClient(req);

    console.log("Starting game", gameId);

    // fetch game and check it's in lobby status before starting
    const game = await fetchGameAndCheckStatus(supabase, gameId, "lobby");

    await updateGameWithStatusTransition(supabase, gameId, "talking_warmup");

    if (!game.players?.length) throw new Error("No players in game");

    // Reset all players' game state - no bot yet during warmup
    await updateAllPlayersInGame(supabase, gameId, {
      vote: null,
      vote_blank: false,
      is_bot: false,
      score: 0,
    });

    const messages = await fetchMessages(supabase, gameId);
    await postIcebreakerMessage(supabase, game, messages);

    const data = JSON.stringify({});
    return new Response(data, { headers, status: 200 });
  } catch (error) {
    return createErrorResponse(error);
  }
});
