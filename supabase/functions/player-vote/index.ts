// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
/// <reference types="https://esm.sh/@supabase/functions-js@2.4.4/src/edge-runtime.d.ts" />

import {
  fetchMessages,
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
import { checkIfAllPlayersVoted } from "../_utils/check-if-all-players-voted.ts";
import {
  determineVotingOutcomes,
  type VotingOutcome,
} from "../_utils/determine-voting-outcomes.ts";
import { getTranslationFunction } from "../_shared/i18n.ts";

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
      await processVotingOutcomes(
        supa,
        votingOutcomes,
        gameId,
        gameAfterVote.lang,
      );

      // Get updated game data for end game check
      const gameAfterPoints = await fetchGameAndCheckStatus(
        supa,
        gameId,
        "voting",
      );

      const maxScore = Math.max(...gameAfterPoints.players.map((p) => p.score));

      if (maxScore >= 5) {
        // Check for tie at winning score
        const winners = gameAfterPoints.players.filter(
          (p) => p.score === maxScore,
        );

        if (winners.length > 1) {
          // Tie at winning score - continue to next round
          console.log(
            "Tie at winning score",
            gameId,
            winners.length,
            "players",
          );

          const t2 = getTranslationFunction(gameAfterPoints.lang);
          const message = t2("messages.tieAtWinningScore", {
            score: maxScore.toString(),
          });
          await postSystemMessage(supa, gameId, message);

          // Continue to next round (same logic as maxScore < 5)
          console.log("Next round due to tie", gameId);

          // Set up next vote
          const game = await fetchGameAndCheckStatus(supa, gameId, "voting");

          // Reset votes and set random player as bot
          const messages = await fetchMessages(supa, gameId);
          await Promise.all([
            setRandomPlayerAsBotAndResetVotes(supa, gameId, game.players),
            updateGameWithStatusTransition(supa, gameId, "talking_warmup"),
            postIcebreakerMessage(supa, game, messages),
          ]);
        } else {
          // Single winner - game over
          console.log("Game over with single winner", gameId);

          // Announce winner
          if (winners.length) {
            const t2 = getTranslationFunction(gameAfterPoints.lang);
            const winnersNames = winners.map((w) => w.name).join(" and ");
            const message = t2("messages.playersWon", {
              players: winnersNames,
            });
            await postSystemMessage(supa, gameId, message);
          }

          // Close the game
          await updateGameWithStatusTransition(supa, gameId, "over");

          // Remove all players from the game
          await removeAllPlayersFromGame(supa, gameId);
        }
      } else {
        // Next round
        const t = getTranslationFunction(gameAfterVote.lang);
        await postSystemMessage(supa, gameId, `💬 ${t("messages.aiIsGone")}`);

        console.log("Next round", gameId);

        // Set up next vote
        const game = await fetchGameAndCheckStatus(supa, gameId, "voting");

        // Reset votes and set random player as bot
        const messages = await fetchMessages(supa, gameId);
        await Promise.all([
          setRandomPlayerAsBotAndResetVotes(supa, gameId, game.players),
          updateGameWithStatusTransition(supa, gameId, "talking_warmup"),
          postIcebreakerMessage(supa, game, messages),
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
  const t = getTranslationFunction(game.lang);

  await postSystemMessage(supabase, game.id, `😱 ${t("messages.resultsIn")}`);
  await postSystemMessage(supabase, game.id, `🥁 ${t("messages.andTheAiWas")}`);

  if (botPlayer) {
    await postSystemMessage(
      supabase,
      game.id,
      `🤖 ${t("messages.aiPlayerReveal", { player: botPlayer.name })}`,
    );
  } else {
    await postSystemMessage(
      supabase,
      game.id,
      `❌ ${t("messages.nobodyWasAi")}`,
    );
  }
}

// Process voting outcomes - update points and post messages
async function processVotingOutcomes(
  supabase: ReturnType<typeof createSupabaseClient>,
  votingOutcomes: VotingOutcome[],
  gameId: string,
  lang: "en" | "fr",
) {
  // Process each voting outcome
  for (const outcome of votingOutcomes) {
    // re-fetch game with updated points
    const game = await fetchGameAndCheckStatus(supabase, gameId, "voting");

    const player = game.players.find((p) => p.id === outcome.playerId);
    if (!player) throw new Error(`Player ${outcome.playerId} not found`);

    // Update player score, ensuring it doesn't go below 0
    const newScore = Math.max(0, player.score + outcome.pointsEarned);
    await updatePlayerInGame(supabase, game.id, outcome.playerId, {
      score: newScore,
    });

    // Post message for this outcome
    const t = getTranslationFunction(lang);
    let message = "";
    switch (outcome.rewardReason) {
      case "foundAI":
        message = t("messages.foundAI", { player: outcome.playerName });
        break;
      case "wronglyAccusedHuman":
        message = t("messages.wronglyAccusedHuman", {
          player: outcome.playerName,
          accused: outcome.votedForName || "someone",
        });
        break;
      case "realizedNoAI":
        message = t("messages.realizedNoAI", { player: outcome.playerName });
        break;
      case "missedAI":
        message = t("messages.missedAI", { player: outcome.playerName });
        break;
    }

    if (message) {
      await postSystemMessage(supabase, game.id, message);
    }
  }
}
