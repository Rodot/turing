// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
/// <reference types="https://esm.sh/@supabase/functions-js/src/edge-runtime.d.ts" />

import { insertMessage } from "../_queries/messages.query.ts";
import {
  fetchPlayers,
  updatePlayer,
  updateRoomPlayers,
} from "../_queries/players.query.ts";
import { fetchUserProfile } from "../_queries/profiles.query.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { createSupabaseClient } from "../_shared/supabase.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { roomId, playerId, vote } = await req.json();
    if (!roomId) throw new Error("Missing roomId");
    if (!playerId) throw new Error("Missing playerId");
    if (!vote) throw new Error("Missing vote");

    const supabase = createSupabaseClient(req);

    await updatePlayer(supabase, { id: playerId, room_id: roomId, vote });
    const players = await fetchPlayers(supabase, roomId);
    const numVotes = players.filter((player) => player.vote).length;
    const numLivingHumans = players
      .filter((player) => player.user_id)
      .filter((player) => !player.is_dead).length;

    // All players have voted
    if (numVotes >= numLivingHumans) {
      // Find the most voted player
      const votes = players.reduce((acc, player) => {
        if (!player.vote) return acc;
        if (!acc[player.vote]) acc[player.vote] = 0;
        acc[player.vote]++;
        return acc;
      }, {} as Record<string, number>);

      const maxVotes = Math.max(...Object.values(votes));
      const mostVotedPlayerIds = Object.keys(votes).filter(
        (playerId) => votes[playerId] === maxVotes
      );

      // Randomly select among the most voted players
      const randomMostVotedPlayerId =
        mostVotedPlayerIds[
          Math.floor(Math.random() * mostVotedPlayerIds.length)
        ];

      if (!randomMostVotedPlayerId)
        throw new Error("Failed to find the most voted player");

      // Mark the most voted player as dead
      await updatePlayer(supabase, {
        id: randomMostVotedPlayerId,
        room_id: roomId,
        is_dead: true,
      });

      // Post message in chat
      const looser = players.find(
        (player) => player.id === randomMostVotedPlayerId
      );
      const message = `${looser?.name} was voted out! 💀💀💀`;
      await insertMessage(supabase, {
        author: "System",
        content: message,
        room_id: roomId,
      });

      // Reset votes
      await updateRoomPlayers(supabase, { room_id: roomId, vote: null });

      const playersAfter = await fetchPlayers(supabase, roomId);
      const livingHumansAfter = playersAfter
        .filter((player) => player.user_id)
        .filter((player) => !player.is_dead);

      // Game over
      if (livingHumansAfter.length === 1) {
        const winner = livingHumansAfter[0];
        if (!winner.user_id) throw new Error("Winner is not human");
        const winnerProfile = await fetchUserProfile(supabase, winner.user_id);
        const message = `"${winnerProfile.name}" aka ${livingHumansAfter[0].name} wins! 🏆🏆🏆`;
        await insertMessage(supabase, {
          author: "System",
          content: message,
          room_id: roomId,
        });
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
