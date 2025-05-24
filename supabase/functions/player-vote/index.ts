// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
/// <reference types="https://esm.sh/@supabase/functions-js@2.4.4/src/edge-runtime.d.ts" />

import { insertMessage } from "../_queries/messages.query.ts";
import {
  fetchGame,
  fetchGameAndCheckStatus,
  updateGameWithStatusTransition,
  updatePlayerInGame,
} from "../_queries/game.query.ts";
import { removeAllPlayersFromGame } from "../_queries/profiles.query.ts";
import { headers } from "../_utils/cors.ts";
import { setRandomPlayerAsBotAndResetVotes } from "../_utils/vote.ts";
import { createSupabaseClient } from "../_utils/supabase.ts";
import { createErrorResponse } from "../_utils/error.ts";
import { pickRandom } from "../_shared/utils.ts";
import { iceBreakers } from "../_shared/lang.ts";

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

    const supabase = createSupabaseClient(req);
    console.log("Voting", { gameId, profileId });

    // Check that game is in voting status
    await fetchGameAndCheckStatus(supabase, gameId, "voting");

    // Apply player vote
    if (vote === "blank") {
      await updatePlayerInGame(supabase, gameId, profileId, {
        vote: null,
        vote_blank: true,
      });
    } else {
      await updatePlayerInGame(supabase, gameId, profileId, {
        vote,
        vote_blank: false,
      });
    }

    // Process voting if all players have voted
    const allVoted = await checkIfAllPlayersVoted(supabase, gameId);
    if (allVoted) {
      console.log("All players have voted", gameId);

      // Announce bot reveal
      await announceBotReveal(supabase, gameId);

      // Determine voting outcomes
      const votingOutcomes = await determineVotingOutcomes(supabase, gameId);

      // Process voting outcomes - update points and post messages
      await processVotingOutcomes(supabase, votingOutcomes, gameId);

      await postSystemMessage(
        supabase,
        gameId,
        "💬 The AI is gone, let's change the topic",
      );

      // Get updated game data for end game check
      const gameAfter = await fetchGame(supabase, gameId);
      if (!gameAfter) throw new Error("Game not found after vote");

      const maxScore = Math.max(...gameAfter.players.map((p) => p.score));

      if (maxScore >= 5) {
        // Game over
        console.log("Game over", gameId);

        // Announce winner
        const winners = gameAfter.players.filter((p) => p.score === maxScore);
        if (winners.length) {
          const message = `${winners.map((w) => w.name).join(" and ")} won! 🏆`;
          await insertMessage(supabase, {
            author_name: "",
            type: "system",
            content: message,
            game_id: gameId,
          });
        }

        // Close the game
        await updateGameWithStatusTransition(supabase, gameId, "over");

        // Remove all players from the game
        await removeAllPlayersFromGame(supabase, gameId);
      } else {
        // Next round
        console.log("Next round", gameId);

        // Set up next vote
        const game = await fetchGame(supabase, gameId);
        if (!game) throw new Error("Game not found");

        // Reset votes and set random player as bot
        await Promise.all([
          setRandomPlayerAsBotAndResetVotes(supabase, gameId, game.players),
          updateGameWithStatusTransition(supabase, gameId, "talking_warmup"),
          insertMessage(supabase, {
            game_id: gameId,
            author_name: "",
            type: "icebreaker",
            content: "💡 " + pickRandom(iceBreakers[game?.lang ?? "en"]),
          }),
        ]);
      }
    }

    const data = JSON.stringify({});
    return new Response(data, { headers, status: 200 });
  } catch (error) {
    return createErrorResponse(error);
  }
});

type RewardReason =
  | "foundBot"
  | "botEscaped"
  | "moreConvincingThanBot"
  | "correctlyGuessedNoBot";

type VotingOutcome = {
  playerId: string;
  playerName: string;
  pointsEarned: number;
  rewardReason: RewardReason;
};

// Helper function to post system message with delay
async function postSystemMessage(
  supabase: ReturnType<typeof createSupabaseClient>,
  gameId: string,
  message: string,
) {
  await insertMessage(supabase, {
    author_name: "",
    type: "system",
    content: message,
    game_id: gameId,
  });
  await new Promise((resolve) => setTimeout(resolve, 3000));
}

// Check if all players have voted
async function checkIfAllPlayersVoted(
  supabase: ReturnType<typeof createSupabaseClient>,
  gameId: string,
): Promise<boolean> {
  const game = await fetchGameAndCheckStatus(supabase, gameId, "voting");

  const activePlayerIds = new Set(game.players.map((p) => p.id));
  const numHumans = game.players.filter((player) => !player.is_bot).length;

  const numVotes = game.players.filter(
    (player) =>
      (player.vote && activePlayerIds.has(player.vote)) || player.vote_blank,
  ).length;

  return numVotes >= numHumans && game.players.length > 1;
}

// Announce bot reveal
async function announceBotReveal(
  supabase: ReturnType<typeof createSupabaseClient>,
  gameId: string,
) {
  const game = await fetchGameAndCheckStatus(supabase, gameId, "voting");

  const botPlayer = game.players.find((player) => player.is_bot);

  await postSystemMessage(supabase, gameId, "😱 Results are in!");
  await postSystemMessage(supabase, gameId, "🥁 And the AI was...");

  if (botPlayer) {
    await postSystemMessage(supabase, gameId, `🤖 ${botPlayer.name}`);
  } else {
    await postSystemMessage(supabase, gameId, `❌ Nobody`);
  }
}

// Determine voting outcomes
async function determineVotingOutcomes(
  supabase: ReturnType<typeof createSupabaseClient>,
  gameId: string,
): Promise<VotingOutcome[]> {
  const game = await fetchGameAndCheckStatus(supabase, gameId, "voting");

  const votingOutcomes: VotingOutcome[] = [];
  const activePlayerIds = new Set(game.players.map((p) => p.id));
  const botPlayer = game.players.find((player) => player.is_bot);

  // Filter players by their votes
  const botVoters = game.players.filter(
    (player) => player.vote === botPlayer?.id,
  );
  const blankVoters = game.players.filter(
    (player) => player.vote_blank === true,
  );

  // Count votes for each player
  const voteCounts = game.players.reduce(
    (counts, player) => {
      if (
        player.vote &&
        !player.vote_blank &&
        activePlayerIds.has(player.vote)
      ) {
        counts[player.vote] = (counts[player.vote] || 0) + 1;
      }
      return counts;
    },
    {} as Record<string, number>,
  );

  // Find players with the most votes
  const maxVotes = Object.keys(voteCounts).length > 0
    ? Math.max(...Object.values(voteCounts))
    : 0;
  const mostVotedPlayers = maxVotes > 0
    ? game.players.filter(
      (player) => (voteCounts[player.id] || 0) === maxVotes,
    )
    : [];

  if (botPlayer) {
    // Scenario: There is a bot in the game

    // 1. Players who correctly identified the bot get points
    if (botVoters.length > 0) {
      botVoters.forEach((voter) => {
        votingOutcomes.push({
          playerId: voter.id,
          playerName: voter.name,
          pointsEarned: 1,
          rewardReason: "foundBot",
        });
      });
    } else {
      // 2. If nobody found the bot, the bot gets a point for escaping
      votingOutcomes.push({
        playerId: botPlayer.id,
        playerName: botPlayer.name,
        pointsEarned: 1,
        rewardReason: "botEscaped",
      });
    }

    // 3. Humans who got more votes than the bot are convincing imposters
    const botVotes = voteCounts[botPlayer.id] || 0;
    const humanImposters = mostVotedPlayers.filter(
      (player) => !player.is_bot && (voteCounts[player.id] || 0) > botVotes,
    );

    humanImposters.forEach((imposter) => {
      votingOutcomes.push({
        playerId: imposter.id,
        playerName: imposter.name,
        pointsEarned: 1,
        rewardReason: "moreConvincingThanBot",
      });
    });
  } else {
    // Scenario: There is no bot in the game

    // 1. Players who voted blank correctly guessed there was no bot
    blankVoters.forEach((voter) => {
      votingOutcomes.push({
        playerId: voter.id,
        playerName: voter.name,
        pointsEarned: 1,
        rewardReason: "correctlyGuessedNoBot",
      });
    });

    // 2. Players with the most votes were the most convincing fake bots
    if (mostVotedPlayers.length > 0) {
      mostVotedPlayers.forEach((player) => {
        votingOutcomes.push({
          playerId: player.id,
          playerName: player.name,
          pointsEarned: 1,
          rewardReason: "moreConvincingThanBot",
        });
      });
    }
  }

  return votingOutcomes;
}

// Process voting outcomes - update points and post messages
async function processVotingOutcomes(
  supabase: ReturnType<typeof createSupabaseClient>,
  votingOutcomes: VotingOutcome[],
  gameId: string,
) {
  // Process each voting outcome
  for (const outcome of votingOutcomes) {
    // fetch game with updated points
    const game = await fetchGameAndCheckStatus(supabase, gameId, "voting");

    const player = game.players.find((p) => p.id === outcome.playerId);
    if (!player) throw new Error(`Player ${outcome.playerId} not found`);

    // Update player score
    await updatePlayerInGame(supabase, gameId, outcome.playerId, {
      score: player.score + outcome.pointsEarned,
    });

    // Post message for this outcome
    let message = "";
    switch (outcome.rewardReason) {
      case "foundBot":
        message = `+1 🧠 to ${outcome.playerName} for finding the AI`;
        break;
      case "botEscaped":
        message = `+1 🧠 to ${outcome.playerName} for pretending to be human`;
        break;
      case "moreConvincingThanBot":
        message = `+1 🧠 to ${outcome.playerName} for pretending to be the AI`;
        break;
      case "correctlyGuessedNoBot":
        message = `+1 🧠 to ${outcome.playerName} who knew there was no AI`;
        break;
    }

    if (message) {
      await postSystemMessage(supabase, gameId, message);
    }
  }
}
