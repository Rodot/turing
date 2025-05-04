// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
/// <reference types="https://esm.sh/@supabase/functions-js@2.4.4/src/edge-runtime.d.ts" />

import { fetchMessages, insertMessage } from "../_queries/messages.query.ts";
import { fetchPlayers, updatePlayer } from "../_queries/players.query.ts";
import { fetchRoom, updateRoom } from "../_queries/room.query.ts";
import { corsHeaders } from "../_utils/cors.ts";
import { setRandomPlayerAsBotAndResetVotes } from "../_utils/vote.ts";
import { createSupabaseClient } from "../_utils/supabase.ts";
import { isNotSystem, nextVoteLength, pickRandom } from "../_shared/utils.ts";
import { iceBreakers } from "../_shared/lang.ts";
import { PlayerData } from "../_types/Database.type.ts";
import { MessageData } from "../_types/Database.type.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { roomId, playerId, vote } = (await req.json()) as {
      roomId: string;
      playerId: string;
      vote: string;
    };
    if (!roomId) throw new Error("Missing roomId");
    if (!playerId) throw new Error("Missing playerId");
    if (!vote) throw new Error("Missing vote");

    const supabase = createSupabaseClient(req);
    console.log("Voting", { roomId, playerId });

    // Apply player vote
    if (vote === "blank") {
      await updatePlayer(supabase, {
        id: playerId,
        room_id: roomId,
        vote: null,
        vote_blank: true,
      });
    } else {
      await updatePlayer(supabase, {
        id: playerId,
        room_id: roomId,
        vote,
        vote_blank: false,
      });
    }

    // Gather all data needed to determine points
    const votingData = await gatherVotingData(supabase, roomId);

    // Process voting if all players have voted
    if (votingData.allVoted && votingData.players.length > 1) {
      console.log("All players have voted", roomId);

      // Give time to read results
      await new Promise((resolve) => setTimeout(resolve, 8000));

      // Determine who got points and why
      const pointAllocations = determinePointsAllocation(votingData);

      // Update players who got points
      await updatePlayerPoints(supabase, pointAllocations, roomId);

      // Post messages about who got points and why
      await postPointsMessages(supabase, pointAllocations, votingData, roomId);

      // Get updated player data for end game check
      const playersAfter = await fetchPlayers(supabase, roomId);
      const maxScore = Math.max(...playersAfter.map((p) => p.score));

      if (maxScore >= 5) {
        // Game over
        console.log("Game over", roomId);

        // Announce winner
        const winners = playersAfter.filter((p) => p.score === maxScore);
        if (winners.length) {
          const message = `${winners.map((w) => w.name).join(" and ")} won! 🏆`;
          await insertMessage(supabase, {
            author: "system",
            content: message,
            room_id: roomId,
          });
        }

        // Close the room
        await updateRoom(supabase, roomId, { status: "over" });
      } else {
        // Next round
        console.log("Next round", roomId);

        // Set up next vote
        const room = await fetchRoom(supabase, roomId);
        const nextVote = votingData.messages.filter(isNotSystem).length +
          nextVoteLength(votingData.players.length);

        // Reset votes and set random player as bot
        await Promise.all([
          setRandomPlayerAsBotAndResetVotes(supabase, votingData.players),
          updateRoom(supabase, roomId, {
            status: "talking",
            last_vote: room?.next_vote,
            next_vote: nextVote,
          }),
          insertMessage(supabase, {
            room_id: roomId,
            author: "intro",
            content: "💡 " + pickRandom(iceBreakers[room?.lang ?? "en"]),
          }),
        ]);
      }
    }

    return new Response(JSON.stringify({}), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});

// Types for the voting data processing
type VotingData = {
  players: PlayerData[];
  messages: MessageData[];
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
  roomId: string,
) {
  // Fetch players and messages data
  const [players, messages] = await Promise.all([
    fetchPlayers(supabase, roomId),
    fetchMessages(supabase, roomId),
  ]);

  // Analyze player data
  const numHumans = players.filter((player) => !player.is_bot).length;
  const botPlayer = players.find((player) => player.is_bot);
  const botVoters = players.filter((player) => player.vote === botPlayer?.id);
  const blankVoters = players.filter((player) => player.vote_blank === true);

  // Count votes for each player
  const voteCounts = players.reduce((counts, player) => {
    if (player.vote && !player.vote_blank) {
      counts[player.vote] = (counts[player.vote] || 0) + 1;
    }
    return counts;
  }, {} as Record<string, number>);

  // Calculate total votes
  const numVotes = players.filter(
    (player) => player.vote || player.vote_blank,
  ).length;

  // Find the maximum number of votes any player received
  const maxVotes = botPlayer ? Math.max(...Object.values(voteCounts)) : 0;
  
  // Calculate human imposters (humans with more votes than bot AND have the most votes)
  const humanImposters = botPlayer
    ? players.filter((player) =>
      !player.is_bot &&
      (voteCounts[player.id] || 0) > (voteCounts[botPlayer.id] || 0) &&
      (voteCounts[player.id] || 0) === maxVotes
    )
    : [];

  return {
    players,
    messages,
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
  const { botPlayer, botVoters, blankVoters, humanImposters } = votingData;

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
  roomId: string,
) {
  const updatePromises = pointAllocations.map((allocation) =>
    updatePlayer(supabase, {
      id: allocation.player.id,
      room_id: roomId,
      score: allocation.player.score + allocation.points,
    })
  );

  await Promise.all(updatePromises);
}

// STEP 4: Function to post messages about who got points and why
async function postPointsMessages(
  supabase: ReturnType<typeof createSupabaseClient>,
  pointAllocations: PointAllocation[],
  votingData: VotingData,
  roomId: string,
) {
  const { botPlayer, humanImposters } = votingData;

  let mainMessage = "";
  let additionalMessage = "";

  // Group players by reason for better messaging
  const foundBotPlayers = pointAllocations
    .filter((a) => a.reason === "foundBot")
    .map((a) => a.player);

  const correctlyGuessedNoBotPlayers = pointAllocations
    .filter((a) => a.reason === "correctlyGuessedNoBot")
    .map((a) => a.player);

  // Create message for bot voters
  if (botPlayer && foundBotPlayers.length > 0) {
    mainMessage = `+1 🧠 for ${
      foundBotPlayers
        .map((p) => p.name)
        .join(" and ")
    } who exorcised ${botPlayer.name} the possessed `;
  }

  // Create message for escaped bot
  if (botPlayer && foundBotPlayers.length === 0) {
    mainMessage = `+1 🧠 for ${botPlayer.name} the possessed who escaped`;
  }

  // Create message for correct blank voters
  if (!botPlayer && correctlyGuessedNoBotPlayers.length > 0) {
    mainMessage = `+1 🧠 for ${
      correctlyGuessedNoBotPlayers
        .map((p) => p.name)
        .join(" and ")
    } who realized that nobody was possessed`;
  }

  // Create message when nobody guessed there was no bot
  if (!botPlayer && correctlyGuessedNoBotPlayers.length === 0) {
    mainMessage = `Nobody guessed that nobody was possessed 😏`;
  }

  // Add message for humans who got more votes than the bot
  if (humanImposters.length > 0) {
    additionalMessage = `\n+1 🧠 for ${
      humanImposters
        .map((p) => p.name)
        .join(" and ")
    } for being more convincing than the actual possessed`;
  }

  // Post the message
  if (mainMessage || additionalMessage) {
    await insertMessage(supabase, {
      author: "system",
      content: mainMessage + additionalMessage,
      room_id: roomId,
    });
  }
}
