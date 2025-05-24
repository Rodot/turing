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
import { PlayerData } from "../_types/Database.type.ts";

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

    // Gather all data needed to determine points
    const votingData = await gatherVotingData(supabase, gameId);

    // Process voting if all players have voted
    if (votingData.allVoted && votingData.players.length > 1) {
      console.log("All players have voted", gameId);

      // Determine who got points and why
      const pointAllocations = determinePointsAllocation(votingData);

      // Post messages about who got points and why
      await postPointsMessages(supabase, pointAllocations, votingData, gameId);

      // Update players who got points
      await updatePlayerPoints(supabase, pointAllocations, gameId);

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

// Types for the voting data processing
type VotingData = {
  players: PlayerData[];
  numHumans: number;
  botPlayer: PlayerData | undefined;
  botVoters: PlayerData[];
  blankVoters: PlayerData[];
  voteCounts: Record<string, number>;
  numVotes: number;
  mostVotedPlayers: PlayerData[];
  allVoted: boolean;
};

type PointAllocation = {
  player: PlayerData;
  points: number;
  reason:
    | "foundBot"
    | "botEscaped"
    | "moreConvincingThanBot"
    | "correctlyGuessedNoBot";
};

// STEP 1: Gather all the data needed to determine point allocation
async function gatherVotingData(
  supabase: ReturnType<typeof createSupabaseClient>,
  gameId: string,
) {
  // Fetch game data
  const game = await fetchGame(supabase, gameId);
  if (!game) throw new Error("Game not found");

  // Get active player IDs for vote validation
  const activePlayerIds = new Set(game.players.map((p) => p.id));

  // Analyze player data
  const numHumans = game.players.filter((player) => !player.is_bot).length;
  const botPlayer = game.players.find((player) => player.is_bot);

  // Filter players by their votes (only count valid votes)
  const botVoters = game.players.filter(
    (player) => player.vote === botPlayer?.id,
  );
  const blankVoters = game.players.filter(
    (player) => player.vote_blank === true,
  );

  // Count votes for each player (only count votes for active players)
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

  // Calculate total votes
  const numVotes = game.players.filter(
    (player) =>
      (player.vote && activePlayerIds.has(player.vote)) || player.vote_blank,
  ).length;

  // Find players with the most votes
  const maxVotes =
    Object.keys(voteCounts).length > 0
      ? Math.max(...Object.values(voteCounts))
      : 0;
  const mostVotedPlayers =
    maxVotes > 0
      ? game.players.filter(
          (player) => (voteCounts[player.id] || 0) === maxVotes,
        )
      : [];

  return {
    players: game.players,
    numHumans,
    botPlayer,
    botVoters,
    blankVoters,
    voteCounts,
    numVotes,
    mostVotedPlayers,
    allVoted: numVotes >= numHumans,
  };
}

// STEP 2: Function to determine who gets points and why
function determinePointsAllocation(votingData: VotingData): PointAllocation[] {
  const { botPlayer, botVoters, blankVoters, mostVotedPlayers, voteCounts } =
    votingData;

  const pointAllocations: PointAllocation[] = [];

  if (botPlayer) {
    // Scenario: There is a bot in the game

    // 1. Players who correctly identified the bot get points
    if (botVoters.length > 0) {
      botVoters.forEach((voter) => {
        pointAllocations.push({
          player: voter,
          points: 1,
          reason: "foundBot",
        });
      });
    } else {
      // 2. If nobody found the bot, the bot gets a point for escaping
      pointAllocations.push({
        player: botPlayer,
        points: 1,
        reason: "botEscaped",
      });
    }

    // 3. Humans who got more votes than the bot are convincing imposters
    const botVotes = voteCounts[botPlayer.id] || 0;
    const humanImposters = mostVotedPlayers.filter(
      (player) => !player.is_bot && (voteCounts[player.id] || 0) > botVotes,
    );

    humanImposters.forEach((imposter) => {
      pointAllocations.push({
        player: imposter,
        points: 1,
        reason: "moreConvincingThanBot",
      });
    });
  } else {
    // Scenario: There is no bot in the game

    // 1. Players who voted blank correctly guessed there was no bot
    blankVoters.forEach((voter) => {
      pointAllocations.push({
        player: voter,
        points: 1,
        reason: "correctlyGuessedNoBot",
      });
    });

    // 2. Players with the most votes were the most convincing fake bots
    if (mostVotedPlayers.length > 0) {
      mostVotedPlayers.forEach((player) => {
        pointAllocations.push({
          player,
          points: 1,
          reason: "moreConvincingThanBot",
        });
      });
    }
  }

  return pointAllocations;
}

// STEP 3: Function to update players who got points
async function updatePlayerPoints(
  supabase: ReturnType<typeof createSupabaseClient>,
  pointAllocations: PointAllocation[],
  gameId: string,
) {
  // Reduce to calculate total points per player
  const pointsByPlayer = pointAllocations.reduce<
    Record<string, { player: PlayerData; totalPoints: number }>
  >((acc, allocation) => {
    const { player, points } = allocation;
    const playerId = player.id;

    if (!acc[playerId]) {
      acc[playerId] = { player, totalPoints: 0 };
    }

    acc[playerId].totalPoints += points;
    return acc;
  }, {});

  // Update each player with their total points
  const updatePromises = Object.values(pointsByPlayer).map(
    ({ player, totalPoints }) =>
      updatePlayerInGame(supabase, gameId, player.id, {
        score: player.score + totalPoints,
      }),
  );

  await Promise.all(updatePromises);
}

// STEP 4: Function to post messages about who got points and why
async function postPointsMessages(
  supabase: ReturnType<typeof createSupabaseClient>,
  pointAllocations: PointAllocation[],
  votingData: VotingData,
  gameId: string,
) {
  const { botPlayer } = votingData;

  // Group players by reason for better messaging
  const foundBotPlayers = pointAllocations
    .filter((a) => a.reason === "foundBot")
    .map((a) => a.player);

  const botEscapedPlayers = pointAllocations
    .filter((a) => a.reason === "botEscaped")
    .map((a) => a.player);

  const convincingImposters = pointAllocations
    .filter((a) => a.reason === "moreConvincingThanBot")
    .map((a) => a.player);

  const correctlyGuessedNoBotPlayers = pointAllocations
    .filter((a) => a.reason === "correctlyGuessedNoBot")
    .map((a) => a.player);

  // Messages to post
  const messages: string[] = [];

  messages.push("😱 Results are in!");
  messages.push("🥁 And the AI was...");

  // Create message to reveal the bot
  if (botPlayer) {
    messages.push(`🤖 ${botPlayer.name}`);
  } else {
    messages.push(`❌ Nobody`);
  }

  // Create message for escaped bot
  if (botEscapedPlayers.length > 0) {
    messages.push(
      `+1 🧠 to ${botEscapedPlayers[0].name} for pretending to be human`,
    );
  }

  // Create message for bot voters
  if (foundBotPlayers.length > 0) {
    messages.push(
      `+1 🧠 to ${foundBotPlayers
        .map((p) => p.name)
        .join(" and ")} for finding the AI`,
    );
  }

  // Add message for convincing imposters
  if (convincingImposters.length > 0) {
    const message = botPlayer
      ? `+1 🧠 to ${convincingImposters.map((p) => p.name).join(" and ")} for being more convincing than the AI`
      : `+1 🧠 to ${convincingImposters.map((p) => p.name).join(" and ")} for pretending to be the AI`;
    messages.push(message);
  }

  // Create message for correct blank voters
  if (correctlyGuessedNoBotPlayers.length > 0) {
    messages.push(
      `+1 🧠 to ${correctlyGuessedNoBotPlayers
        .map((p) => p.name)
        .join(" and ")} who knew there was no AI`,
    );
  }

  messages.push("💬 The AI is gone, let's change the topic");

  // Post all messages sequentially with delays
  for (const message of messages) {
    await insertMessage(supabase, {
      author_name: "",
      type: "system",
      content: message,
      game_id: gameId,
    });
    await new Promise((resolve) => setTimeout(resolve, 3000));
  }
}
