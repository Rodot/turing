import {
  fetchGame,
  updateGameWithStatusTransition,
} from "../_queries/game.query.ts";
import { postSystemMessage } from "../_queries/messages.query.ts";
import { removeAllPlayersFromGame } from "../_queries/profiles.query.ts";
import { headers } from "../_utils/cors.ts";
import { createSupabaseClient } from "../_utils/supabase.ts";
import { createErrorResponse } from "../_utils/error.ts";
import { getPlayerFromGame } from "../_shared/utils.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers });
  }

  try {
    const { gameId } = (await req.json()) as {
      gameId: string;
    };
    if (!gameId) throw new Error("Missing gameId");
    const supabase = createSupabaseClient(req);

    console.log("Ending game", { gameId });
    await updateGameWithStatusTransition(supabase, gameId, "over");

    const userResponse = await supabase.auth.getUser();
    if (userResponse.error) {
      throw new Error(userResponse.error.message);
    }
    const user = userResponse.data.user;

    // Get game to find the player name
    const game = await fetchGame(supabase, gameId);
    if (!game) throw new Error("Game not found");

    const player = getPlayerFromGame(game, user.id);
    if (!player) throw new Error("Player not found in game");

    // Post a message
    await postSystemMessage(
      supabase,
      gameId,
      `❌ ${player.name} ended the game`,
    );

    // Remove all players from the game
    await removeAllPlayersFromGame(supabase, gameId);

    const data = JSON.stringify({});
    return new Response(data, { headers, status: 200 });
  } catch (error) {
    return createErrorResponse(error);
  }
});
