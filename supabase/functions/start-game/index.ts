// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
/// <reference types="https://esm.sh/@supabase/functions-js/src/edge-runtime.d.ts" />

import {
  fetchGame,
  updateGame,
  updateAllPlayersInGame,
  updatePlayerInGame,
} from "../_queries/game.query.ts";
import { headers } from "../_utils/cors.ts";
import { createSupabaseClient } from "../_utils/supabase.ts";
import { insertMessage } from "../_queries/messages.query.ts";
import { pickRandom } from "../_shared/utils.ts";
import { iceBreakers } from "../_shared/lang.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers });
  }

  try {
    const { gameId }: { gameId: string } = await req.json();
    if (!gameId) throw new Error("Missing gameId");
    console.log("Starting game", gameId);

    const supabase = createSupabaseClient(req);

    // fetch game
    const game = await fetchGame(supabase, gameId);
    if (!game) throw new Error("Game not found");

    if (!game.players?.length) throw new Error("No players in game");

    // Select random player to be the bot
    const noBotThisRound = Math.random() <= 1 / (game.players.length + 1);
    const botPlayer = noBotThisRound ? undefined : pickRandom(game.players);

    // Reset all players' game state
    await updateAllPlayersInGame(supabase, gameId, {
      vote: null,
      vote_blank: false,
      is_bot: false,
      score: 0,
    });

    // Set random player as bot if selected
    if (botPlayer) {
      await updatePlayerInGame(supabase, gameId, botPlayer.id, {
        is_bot: true,
      });
    }

    await insertMessage(supabase, {
      game_id: gameId,
      author: "icebreaker",
      content: "💡 " + pickRandom(iceBreakers[game.lang]),
    });

    // start the game
    await updateGame(supabase, gameId, {
      status: "talking",
    });

    const data = JSON.stringify({});
    return new Response(data, { headers, status: 200 });
  } catch (error) {
    console.error(error);
    const data = JSON.stringify({ error });
    return new Response(data, { headers, status: 400 });
  }
});
