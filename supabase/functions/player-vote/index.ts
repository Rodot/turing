// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
/// <reference types="https://esm.sh/@supabase/functions-js@2.4.4/src/edge-runtime.d.ts" />

import {
  postIcebreakerMessage,
  postSystemMessage,
} from "../_queries/messages.query.ts";
import {
  fetchGameAndCheckStatus,
  updateGameWithStatusTransition,
  updatePlayerInGame,
} from "../_queries/game.query.ts";
import type { GameData } from "../_types/Database.type.ts";
import { removeAllPlayersFromGame } from "../_queries/profiles.query.ts";
import { headers } from "../_utils/cors.ts";
import { setRandomPlayerAsBotAndResetVotes } from "../_utils/vote.ts";
import { createSupabaseClient } from "../_utils/supabase.ts";
import { createErrorResponse } from "../_utils/error.ts";
import { pickRandom } from "../_shared/utils.ts";
import { iceBreakers } from "../_shared/lang.ts";
import { checkIfAllPlayersVoted } from "../_utils/check-if-all-players-voted.ts";
import {
  determineVotingOutcomes,
  type VotingOutcome,
} from "../_utils/determine-voting-outcomes.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers });
  }

  try {
    const { gameId, profileId, vote } = (await req.json()) as {
      gameId: string;
      profileId: string;
      vote: string;
    };
    if (!gameId) throw new Error("Missing gameId");
    if (!profileId) throw new Error("Missing profileId");
    if (!vote) throw new Error("Missing vote");

    const supa = createSupabaseClient(req);
    console.log("Voting", { gameId, profileId });

    // Check that game is in voting status
    await fetchGameAndCheckStatus(supa, gameId, "voting");

    // Apply player vote
    if (vote === "blank") {
      await updatePlayerInGame(supa, gameId, profileId, {
        vote: null,
        vote_blank: true,
      });
    } else {
      await updatePlayerInGame(supa, gameId, profileId, {
        vote,
        vote_blank: false,
      });
    }

    const gameAfterVote = await fetchGameAndCheckStatus(supa, gameId, "voting");

    // Process voting if all players have voted
    const allVoted = checkIfAllPlayersVoted(gameAfterVote);
    if (allVoted) {
      console.log("All players have voted", gameId);

      // Announce bot reveal
      await announceBotReveal(supa, gameAfterVote);

      // Determine voting outcomes
      const votingOutcomes = determineVotingOutcomes(gameAfterVote);

      // Process voting outcomes - update points and post messages
      await processVotingOutcomes(supa, votingOutcomes, gameId);

      await postSystemMessage(
        supa,
        gameId,
        "💬 The AI is gone, let's change the topic",
      );

      // Get updated game data for end game check
      const gameAfterPoints = await fetchGameAndCheckStatus(
        supa,
        gameId,
        "voting",
      );

      const maxScore = Math.max(...gameAfterPoints.players.map((p) => p.score));

      if (maxScore >= 5) {
        // Game over
        console.log("Game over", gameId);

        // Announce winner
        const winners = gameAfterPoints.players.filter(
          (p) => p.score === maxScore,
        );
        if (winners.length) {
          const message = `${winners.map((w) => w.name).join(" and ")} won! 🏆`;
          await postSystemMessage(supa, gameId, message);
        }

        // Close the game
        await updateGameWithStatusTransition(supa, gameId, "over");

        // Remove all players from the game
        await removeAllPlayersFromGame(supa, gameId);
      } else {
        // Next round
        console.log("Next round", gameId);

        // Set up next vote
        const game = await fetchGameAndCheckStatus(supa, gameId, "voting");

        // Reset votes and set random player as bot
        await Promise.all([
          setRandomPlayerAsBotAndResetVotes(supa, gameId, game.players),
          updateGameWithStatusTransition(supa, gameId, "talking_warmup"),
          postIcebreakerMessage(
            supa,
            gameId,
            pickRandom(iceBreakers[game?.lang ?? "en"]),
          ),
        ]);
      }
    }

    const data = JSON.stringify({});
    return new Response(data, { headers, status: 200 });
  } catch (error) {
    return createErrorResponse(error);
  }
});

// Announce bot reveal
async function announceBotReveal(
  supabase: ReturnType<typeof createSupabaseClient>,
  game: GameData,
) {
  const botPlayer = game.players.find((player) => player.is_bot);

  await postSystemMessage(supabase, game.id, "😱 Results are in!");
  await postSystemMessage(supabase, game.id, "🥁 And the AI was...");

  if (botPlayer) {
    await postSystemMessage(supabase, game.id, `🤖 ${botPlayer.name}`);
  } else {
    await postSystemMessage(supabase, game.id, `❌ Nobody`);
  }
}

// Process voting outcomes - update points and post messages
async function processVotingOutcomes(
  supabase: ReturnType<typeof createSupabaseClient>,
  votingOutcomes: VotingOutcome[],
  gameId: string,
) {
  // Process each voting outcome
  for (const outcome of votingOutcomes) {
    // re-fetch game with updated points
    const game = await fetchGameAndCheckStatus(supabase, gameId, "voting");

    const player = game.players.find((p) => p.id === outcome.playerId);
    if (!player) throw new Error(`Player ${outcome.playerId} not found`);

    // Update player score
    await updatePlayerInGame(supabase, game.id, outcome.playerId, {
      score: player.score + outcome.pointsEarned,
    });

    // Post message for this outcome
    let message = "";
    switch (outcome.rewardReason) {
      case "foundBot":
        message = `+1 🧠 to ${outcome.playerName} for finding the AI`;
        break;
      case "botAvoided":
        message = `+1 🧠 to ${outcome.playerName} for fooling everyone as the AI`;
        break;
      case "bestActing":
        message = `+1 🧠 to ${outcome.playerName} for best AI impression`;
        break;
      case "correctlyGuessedNoBot":
        message = `+1 🧠 to ${outcome.playerName} who sensed there was no AI`;
        break;
    }

    if (message) {
      await postSystemMessage(supabase, game.id, message);
    }
  }
}
