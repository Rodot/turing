// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
/// <reference types="https://esm.sh/@supabase/functions-js/src/edge-runtime.d.ts" />

import { insertPlayers } from "../_queries/players.query.ts";
import { fetchRoomProfiles } from "../_queries/profiles.query.ts";
import { fetchRoom, updateRoom } from "../_queries/room.query.ts";
import { nextChatTurn } from "../_shared/chat.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { createSupabaseClient } from "../_shared/supabase.ts";
import { PlayerDataInsert } from "../_types/Database.type.ts";

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
    if (!profiles?.length) throw new Error("Room not found");

    const humanNumber = profiles.length;
    const botNumber = humanNumber;

    const players: PlayerDataInsert[] = [];

    const names = [
      "🐶 Alice",
      "🌳 Bob",
      "🍎 Charlie",
      "🚗 David",
      "🎈 Eve",
      "🌞 Frank",
      "🌧️ Grace",
      "🍕 Heidi",
      "🏀 Ivan",
      "🎧 Judy",
      "🎁 Kevin",
      "🚀 Mallory",
      "🌈 Nancy",
      "🎩 Olivia",
      "🐠 Peggy",
      "🍦 Quentin",
      "🏖️ Romeo",
      "🎃 Sybil",
      "📚 Trent",
      "🎸 Ursula",
      "🌺 Victor",
      "🍿 Walter",
      "🏋️‍♀️ Xavier",
      "🎡 Yvonne",
      "🐎 Zelda",
    ];

    const popRandom = (array: Array<any>) => {
      const index = Math.floor(Math.random() * array.length);
      return array.splice(index, 1)[0];
    };

    // human players
    profiles.forEach((profile) => {
      players.push({
        user_id: profile.id,
        name: popRandom(names) ?? "No Name",
        room_id: roomId,
      });
    });

    // bot players
    for (let i = 0; i < botNumber; i++) {
      players.push({
        user_id: null,
        name: popRandom(names) ?? "No Name",
        room_id: roomId,
      });
    }

    // insert players
    await insertPlayers(supabase, players);

    // start the game
    const newRoom = { ...room, status: "playing" };
    await updateRoom(supabase, roomId, newRoom);

    await nextChatTurn(supabase, roomId);

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
