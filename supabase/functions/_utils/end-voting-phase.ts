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
import { setRandomPlayerAsBotAndResetVotes } from "./vote.ts";
import { createSupabaseClient } from "./supabase.ts";
import {
  determineVotingOutcomes,
  type VotingOutcome,
} from "./determine-voting-outcomes.ts";
import { getTranslationFunction } from "../_shared/i18n.ts";

// End voting phase - handles all logic when voting ends (either all voted or timeout)
export async function endVotingPhase(
  supa: ReturnType<typeof createSupabaseClient>,
  game: GameData,
) {
  const gameId = game.id;

  // Announce bot reveal
  await announceBotReveal(supa, game);

  // Determine voting outcomes
  const votingOutcomes = determineVotingOutcomes(game);

  // Process voting outcomes - update points and post messages
  await processVotingOutcomes(supa, votingOutcomes, gameId, game.lang);

  // Get updated game data for end game check
  const gameAfterPoints = await fetchGameAndCheckStatus(supa, gameId, "voting");

  const maxScore = Math.max(...gameAfterPoints.players.map((p) => p.score));

  if (maxScore >= 5) {
    // Check for tie at winning score
    const winners = gameAfterPoints.players.filter((p) => p.score === maxScore);

    if (winners.length > 1) {
      // Tie at winning score - continue to next round
      console.log("Tie at winning score", gameId, winners.length, "players");

      const t2 = getTranslationFunction(gameAfterPoints.lang);
      const message = t2("messages.tieAtWinningScore", {
        score: maxScore.toString(),
      });
      await postSystemMessage(supa, gameId, message);

      // Continue to next round (same logic as maxScore < 5)
      console.log("Next round due to tie", gameId);

      // Set up next vote
      const gameForNextRound = await fetchGameAndCheckStatus(
        supa,
        gameId,
        "voting",
      );

      // Reset votes and set random player as bot
      const messages = await fetchMessages(supa, gameId);
      await Promise.all([
        setRandomPlayerAsBotAndResetVotes(
          supa,
          gameId,
          gameForNextRound.players,
        ),
        updateGameWithStatusTransition(supa, gameId, "talking_warmup"),
        postIcebreakerMessage(supa, gameForNextRound, messages),
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
    const t = getTranslationFunction(game.lang);
    await postSystemMessage(
      supa,
      gameId,
      `💬 ${t("messages.roundEndNewTopic")}`,
    );

    console.log("Next round", gameId);

    // Set up next vote
    const gameForNextRound = await fetchGameAndCheckStatus(
      supa,
      gameId,
      "voting",
    );

    // Reset votes and set random player as bot
    const messages = await fetchMessages(supa, gameId);
    await Promise.all([
      setRandomPlayerAsBotAndResetVotes(supa, gameId, gameForNextRound.players),
      updateGameWithStatusTransition(supa, gameId, "talking_warmup"),
      postIcebreakerMessage(supa, gameForNextRound, messages),
    ]);
  }
}

// Announce bot reveal
async function announceBotReveal(
  supabase: ReturnType<typeof createSupabaseClient>,
  game: GameData,
) {
  const botPlayer = game.players.find((player) => player.is_bot);
  const t = getTranslationFunction(game.lang);

  await postSystemMessage(
    supabase,
    game.id,
    `🥁 ${t("messages.aiIdentityReveal")}`,
  );

  if (botPlayer) {
    await postSystemMessage(
      supabase,
      game.id,
      `🤖 ${t("messages.revealedPlayerName", { player: botPlayer.name })}`,
    );
  } else {
    await postSystemMessage(
      supabase,
      game.id,
      `❌ ${t("messages.noAiThisRound")}`,
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
      case "mostVotedHuman":
        message = t("messages.mostVotedHuman", { player: outcome.playerName });
        break;
      case "invisibleAI":
        message = t("messages.invisibleAI", { player: outcome.playerName });
        break;
    }

    if (message) {
      await postSystemMessage(supabase, game.id, message);
    }
  }
}
