// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
/// <reference types="https://esm.sh/@supabase/functions-js/src/edge-runtime.d.ts" />

import { fetchRoomProfiles } from "../_queries/profiles.query.ts";
import { fetchRoom, updateRoom } from "../_queries/room.query.ts";
import { nextChatTurn } from "../_utils/chat.ts";
import { nextVoteLength } from "../_utils/vote.ts";
import { corsHeaders } from "../_utils/cors.ts";
import { createSupabaseClient } from "../_utils/supabase.ts";
import { PlayerData } from "../_types/Database.type.ts";
import { insertMessage } from "../_queries/messages.query.ts";
import { insertPlayers } from "../_queries/players.query.ts";

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

const iceBreakers = [
  "If you could have any superpower, what would it be and why?",
  "What's the most adventurous thing you've ever done?",
  "If you could travel anywhere in the world, where would you go and why?",
  "What's your favorite movie or TV show, and what do you love about it?",
  "If you could meet any historical figure, who would it be and what would you ask them?",
  "What's the most interesting or unusual job you've ever had?",
  "If you could instantly become an expert in one skill or hobby, what would it be?",
  "What's the best piece of advice you've ever received?",
  "If you could have dinner with any three people, living or dead, who would they be?",
  "What's your favorite book, and how has it influenced you?",
  "If you could time travel, would you go to the past or the future, and why?",
  "What's the most memorable gift you've ever received or given?",
  "If you could switch lives with someone for a day, who would it be and why?",
  "What's the most interesting place you've ever visited?",
  "If you could have any animal as a pet, what would it be?",
  "What's your favorite childhood memory?",
  "If you could learn any language instantly, which one would you choose?",
  "What's the most daring food you've ever tried?",
  "If you could be any fictional character, who would you choose and why?",
  "What's the most important life lesson you've learned so far?",
];

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
      author: "system",
      content: pickRandom(iceBreakers),
    });

    // start the game
    const nextVote = nextVoteLength(players.length);
    const newRoom = { status: "talking", next_vote: nextVote };
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
