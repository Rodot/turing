import {
  fetchGameAndCheckStatus,
  updateGameWithStatusTransition,
} from "../_queries/game.query.ts";
import { postSystemMessage } from "../_queries/messages.query.ts";
import { headers } from "../_utils/cors.ts";
import { createSupabaseClient } from "../_utils/supabase.ts";
import { createErrorResponse } from "../_utils/error.ts";
import { getPlayerFromGame } from "../_shared/utils.ts";
import { getTranslationFunction } from "../_shared/i18n.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers });
  }

  try {
    const { gameId } = (await req.json()) as {
      gameId: string;
    };
    if (!gameId) throw new Error("Missing gameId");
    console.log("Starting vote", { gameId });

    const supabase = createSupabaseClient(req);
    const userResponse = await supabase.auth.getUser();
    if (userResponse.error) {
      throw new Error(userResponse.error.message);
    }
    const user = userResponse.data.user;

    // Get game to find the player name and check status
    const game = await fetchGameAndCheckStatus(
      supabase,
      gameId,
      "talking_hunt",
    );

    const player = getPlayerFromGame(game, user.id);
    if (!player) throw new Error("Player not found in game");

    // Get translation function based on game language
    const t = getTranslationFunction(game.lang);

    // Post a message
    await postSystemMessage(
      supabase,
      gameId,
      `🗳️ ${t("messages.startedVote", { player: player.name })}`,
    );

    // Set the game status to "voting"
    await updateGameWithStatusTransition(supabase, gameId, "voting");

    const data = JSON.stringify({});
    return new Response(data, { headers, status: 200 });
  } catch (error) {
    return createErrorResponse(error);
  }
});
