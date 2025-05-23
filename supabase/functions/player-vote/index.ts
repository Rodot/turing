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
          updateGameWithStatusTransition(supabase, gameId, "talking"),
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
    console.error(error);
    const data = JSON.stringify({ error });
    return new Response(data, { headers, status: 400 });
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
  humanImposters: PlayerData[];
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

  // Analyze player data
  const numHumans = game.players.filter((player) => !player.is_bot).length;
  const botPlayer = game.players.find((player) => player.is_bot);
  const botVoters = game.players.filter(
    (player) => player.vote === botPlayer?.id,
  );
  const blankVoters = game.players.filter(
    (player) => player.vote_blank === true,
  );

  // Count votes for each player
  const voteCounts = game.players.reduce(
    (counts, player) => {
      if (player.vote && !player.vote_blank) {
        counts[player.vote] = (counts[player.vote] || 0) + 1;
      }
      return counts;
    },
    {} as Record<string, number>,
  );

  // Calculate total votes
  const numVotes = game.players.filter(
    (player) => player.vote || player.vote_blank,
  ).length;

  // Find the maximum number of votes any player received
  const maxVotes = botPlayer ? Math.max(...Object.values(voteCounts)) : 0;

  // Calculate human imposters (humans with more votes than bot AND have the most votes)
  const humanImposters = botPlayer
    ? game.players.filter(
        (player) =>
          !player.is_bot &&
          (voteCounts[player.id] || 0) > (voteCounts[botPlayer.id] || 0) &&
          (voteCounts[player.id] || 0) === maxVotes,
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
    humanImposters,
    allVoted: numVotes >= numHumans,
  };
}

// STEP 2: Function to determine who gets points and why
function determinePointsAllocation(votingData: VotingData): PointAllocation[] {
  const {
    botPlayer,
    botVoters,
    blankVoters,
    humanImposters,
    players,
    voteCounts,
  } = votingData;

  const pointAllocations: PointAllocation[] = [];

  // Points for bot voters
  if (botPlayer && botVoters.length > 0) {
    botVoters.forEach((voter) => {
      pointAllocations.push({
        player: voter,
        points: 1,
        reason: "foundBot",
      });
    });
  }

  // Points for bot if nobody found it
  if (botPlayer && botVoters.length === 0) {
    pointAllocations.push({
      player: botPlayer,
      points: 1,
      reason: "botEscaped",
    });
  }

  // Points for human imposters
  if (humanImposters.length > 0) {
    humanImposters.forEach((imposter) => {
      pointAllocations.push({
        player: imposter,
        points: 1,
        reason: "moreConvincingThanBot",
      });
    });
  }

  // Points for players with most votes when there's no bot (similar to human imposters)
  if (!botPlayer && Object.keys(voteCounts).length > 0) {
    const maxVotes = Math.max(...Object.values(voteCounts));
    const mostVotedPlayers = players.filter(
      (player) => (voteCounts[player.id] || 0) === maxVotes && maxVotes > 0,
    );

    mostVotedPlayers.forEach((player) => {
      pointAllocations.push({
        player,
        points: 1,
        reason: "moreConvincingThanBot",
      });
    });
  }

  // Points for blank voters when no bot
  if (!botPlayer && blankVoters.length > 0) {
    blankVoters.forEach((voter) => {
      pointAllocations.push({
        player: voter,
        points: 1,
        reason: "correctlyGuessedNoBot",
      });
    });
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
  const { botPlayer, humanImposters } = votingData;

  // Group players by reason for better messaging
  const foundBotPlayers = pointAllocations
    .filter((a) => a.reason === "foundBot")
    .map((a) => a.player);

  const correctlyGuessedNoBotPlayers = pointAllocations
    .filter((a) => a.reason === "correctlyGuessedNoBot")
    .map((a) => a.player);

  const mostVotedNoBotPlayers = pointAllocations
    .filter((a) => a.reason === "moreConvincingThanBot" && !botPlayer)
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
  if (botPlayer && foundBotPlayers.length === 0) {
    messages.push(`+1 🧠 to ${botPlayer.name} for pretending to be human`);
  }

  // Add message for humans who got more votes than the bot
  if (humanImposters.length > 0) {
    messages.push(
      `+1 🧠 to ${humanImposters
        .map((p) => p.name)
        .join(" and ")} for pretending to be the AI`,
    );
  }

  // Add message for most voted players when there's no bot
  if (!botPlayer && mostVotedNoBotPlayers.length > 0) {
    messages.push(
      `+1 🧠 to ${mostVotedNoBotPlayers
        .map((p) => p.name)
        .join(" and ")} for pretending to be the AI`,
    );
  }

  // Create message for bot voters
  if (botPlayer && foundBotPlayers.length > 0) {
    messages.push(
      `+1 🧠 to ${foundBotPlayers
        .map((p) => p.name)
        .join(" and ")} for finding the AI`,
    );
  }

  // Create message for correct blank voters
  if (!botPlayer && correctlyGuessedNoBotPlayers.length > 0) {
    messages.push(
      `+1 🧠 to ${correctlyGuessedNoBotPlayers
        .map((p) => p.name)
        .join(" and ")} who knew there was no AI`,
    );
  }

  // Post all messages sequentially
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
