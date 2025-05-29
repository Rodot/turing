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
import { endVotingPhase } from "../_utils/end-voting-phase.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers });
  }

  try {
    const { gameId } = (await req.json()) as {
      gameId: string;
    };
    console.log("Starting vote", { gameId });
    if (!gameId) throw new Error("Missing gameId");

    const supabase = createSupabaseClient(req);

    // Set the game status to "voting"
    const game = await updateGameWithStatusTransition(
      supabase,
      gameId,
      "voting",
    );

    const userResponse = await supabase.auth.getUser();
    if (userResponse.error) {
      throw new Error(userResponse.error.message);
    }
    const user = userResponse.data.user;

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

    // Post AI control instructions after vote announcement
    await postSystemMessage(
      supabase,
      gameId,
      `${t("messages.voteInstructionsHunting")}`,
    );
    await postSystemMessage(
      supabase,
      gameId,
      `${t("messages.voteInstructionsDeception")}`,
    );

    // Start 30-second timeout for voting
    console.log("Starting 30s voting timeout", gameId);
    await new Promise((resolve) => setTimeout(resolve, 31000));

    try {
      // Check if game is still in voting state
      const gameAfterTimeout = await fetchGameAndCheckStatus(
        supabase,
        gameId,
        "voting",
      );
      if (gameAfterTimeout.status === "voting") {
        console.log("Voting timeout reached, ending vote", gameId);
        await endVotingPhase(supabase, gameAfterTimeout);
      }
    } catch (error) {
      console.error("Voting timeout error:", error);
    }

    const data = JSON.stringify({});
    return new Response(data, { headers, status: 200 });
  } catch (error) {
    return createErrorResponse(error);
  }
});
