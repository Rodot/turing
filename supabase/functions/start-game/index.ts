// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
/// <reference types="https://esm.sh/@supabase/functions-js/src/edge-runtime.d.ts" />

import { fetchRoomProfiles } from "../_queries/profiles.query.ts";
import { fetchRoom, updateRoom } from "../_queries/room.query.ts";
import { corsHeaders } from "../_utils/cors.ts";
import { createSupabaseClient } from "../_utils/supabase.ts";
import { PlayerData } from "../_types/Database.type.ts";
import { insertMessage } from "../_queries/messages.query.ts";
import { insertPlayers } from "../_queries/players.query.ts";
import { nextVoteLength } from "../_shared/chat.ts";
import { iceBreakersFr } from "../_shared/lang.ts";

export const popRandom = <T>(array: Array<T>): T => {
  const index = Math.floor(Math.random() * array.length);
  return array.splice(index, 1)[0];
};

export const pickRandom = <T>(array: Array<T>): T => {
  const index = Math.floor(Math.random() * array.length);
  return array[index];
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { roomId } = await req.json();
    if (!roomId) {
      throw new Error("Missing roomId");
    }

    const supabase = createSupabaseClient(req);

    // fetch room
    const room = await fetchRoom(supabase, roomId);
    if (!room) throw new Error("Room not found");

    // fetch profiles
    const profiles = await fetchRoomProfiles(supabase, roomId);
    if (!profiles?.length) throw new Error("No profiles in room");

    const players: Partial<PlayerData>[] = [];

    // human players
    const botProfile = pickRandom(profiles);
    profiles.forEach((profile) => {
      players.push({
        user_id: profile.id,
        name: profile.name,
        room_id: roomId,
        vote: null,
        is_bot: profile.id === botProfile.id,
      });
    });

    // insert players
    await insertPlayers(supabase, players);

    await insertMessage(supabase, {
      room_id: roomId,
      author: "intro",
      content: pickRandom(iceBreakersFr),
    });

    // start the game
    const nextVote = nextVoteLength(players.length);
    const newRoom = { status: "talking", next_vote: nextVote };
    await updateRoom(supabase, roomId, newRoom);

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
