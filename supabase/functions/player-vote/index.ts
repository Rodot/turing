// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
/// <reference types="https://esm.sh/@supabase/functions-js/src/edge-runtime.d.ts" />

import { fetchMessages, insertMessage } from "../_queries/messages.query.ts";
import { fetchPlayers, updatePlayer } from "../_queries/players.query.ts";
import { fetchRoom, updateRoom } from "../_queries/room.query.ts";
import { corsHeaders } from "../_utils/cors.ts";
import {
  nextChatTurn,
  setRandomPlayerAsBotAndResetVotes,
} from "../_utils/chat.ts";
import { createSupabaseClient } from "../_utils/supabase.ts";
import { nextVoteLength } from "../_utils/vote.ts";
import { isNotSystem } from "../_shared/chat.ts";

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

    // Apply player vote
    await updatePlayer(supabase, { id: playerId, room_id: roomId, vote });
    const players = await fetchPlayers(supabase, roomId);
    const messages = await fetchMessages(supabase, roomId);
    const numVotes = players.filter((player) => player.vote).length;
    const numHumans = players.filter((player) => !player.is_bot).length;
    const botPlayer = players.find((player) => player.is_bot);

    if (!botPlayer) throw new Error("No bot player");

    // All players have voted
    if (numVotes >= numHumans) {
      // Find the most voted player
      const votes = players.reduce((acc, player) => {
        if (!player.vote) return acc;
        if (!acc[player.vote]) acc[player.vote] = 0;
        acc[player.vote]++;
        return acc;
      }, {} as Record<string, number>);

      const maxVotes = Math.max(...Object.values(votes));
      const votedPlayers = Object.keys(votes)
        .filter((playerId) => votes[playerId] === maxVotes)
        .map((playerId) => players.find((player) => player.id === playerId));

      if (!votedPlayers?.length)
        throw new Error("Failed to find voted players");

      if (votedPlayers.length > 1) {
        await insertMessage(supabase, {
          author: "system",
          content: `It's a tie between ${votedPlayers
            .map((p) => p?.name)
            .join(" and ")}, let's roll a dice... 🎲`,
          room_id: roomId,
        });
        await new Promise((resolve) => setTimeout(resolve, 3000));
      }

      // Randomly select among the most voted players
      const looser =
        votedPlayers[Math.floor(Math.random() * votedPlayers.length)];

      if (!looser) throw new Error("Failed to find the most voted player");

      // +1 point for the bot if a human was voted
      if (!looser.is_bot) {
        await updatePlayer(supabase, {
          id: botPlayer.id,
          room_id: roomId,
          score: botPlayer.score + 1,
        });
      }

      // +1 point for those who voted for the bot
      const roundWinners = players.filter((p) => p.vote === botPlayer.id);
      await Promise.all(
        roundWinners.map((winner) =>
          updatePlayer(supabase, {
            id: winner.id,
            room_id: roomId,
            score: winner.score + 1,
          })
        )
      );

      // wait before closing vote results
      await new Promise((resolve) => setTimeout(resolve, 3000));

      // Post message in chat
      let message = "";
      if (looser.is_bot) {
        // it was a bot
        message = `${looser?.name} was 🤖 possessed and ⚡ exorcised, well done!`;
      } else {
        // it was a human
        message = `${looser?.name} was ⚡ exorcised... but it was 🧑 human! ${botPlayer?.name} was 🤖 possessed and went under the radar.`;
      }
      await insertMessage(supabase, {
        author: "system",
        content: message,
        room_id: roomId,
      });

      // Reset votes and set random player as bot
      await setRandomPlayerAsBotAndResetVotes(supabase, players);

      const playersAfter = await fetchPlayers(supabase, roomId);

      const maxScore = Math.max(...playersAfter.map((p) => p.score));

      if (maxScore >= 3) {
        // Game over
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
        // Start next chat turn

        // set next vote
        const room = await fetchRoom(supabase, roomId);
        const nextVote =
          messages.filter(isNotSystem).length + nextVoteLength(players.length);
        await updateRoom(supabase, roomId, {
          status: "talking",
          next_player_id: null,
          last_vote: room?.next_vote,
          next_vote: nextVote,
        });
        await nextChatTurn(supabase, roomId);
      }
    }

    const data = {};

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
