// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
/// <reference types="https://esm.sh/@supabase/functions-js/src/edge-runtime.d.ts" />

import { fetchRoomProfiles } from "../_queries/profiles.query.ts";
import { fetchRoom, updateRoom } from "../_queries/room.query.ts";
import { headers } from "../_utils/cors.ts";
import { createSupabaseClient } from "../_utils/supabase.ts";
import { PlayerData } from "../_types/Database.type.ts";
import { insertMessage } from "../_queries/messages.query.ts";
import { insertPlayers } from "../_queries/players.query.ts";
import { nextVoteLength, pickRandom } from "../_shared/utils.ts";
import { iceBreakers } from "../_shared/lang.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers });
  }

  try {
    const { roomId }: { roomId: string } = await req.json();
    if (!roomId) throw new Error("Missing roomId");
    console.log("Starting game", roomId);

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
      content: "💡 " + pickRandom(iceBreakers[room.lang]),
    });

    // start the game
    const nextVote = nextVoteLength(players.length);
    await updateRoom(supabase, roomId, {
      status: "talking",
      next_vote: nextVote,
    });

    const data = JSON.stringify({});
    return new Response(data, { headers, status: 200 });
  } catch (error) {
    console.error(error);
    const data = JSON.stringify({ error });
    return new Response(data, { headers, status: 400 });
  }
});
