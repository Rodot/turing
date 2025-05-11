// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
/// <reference types="https://esm.sh/@supabase/functions-js/src/edge-runtime.d.ts" />

import {
  addProfileToRoom,
  fetchUserProfile,
} from "../_queries/profiles.query.ts";
import { insertRoom, updateRoom } from "../_queries/room.query.ts";
import { headers } from "../_utils/cors.ts";
import { createSupabaseClient } from "../_utils/supabase.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers });
  }

  try {
    const supabase = createSupabaseClient(req);
    const userResponse = await supabase.auth.getUser();
    if (userResponse.error) {
      throw new Error(userResponse.error.message);
    }
    const user = userResponse.data.user;

    // create new room
    const [room, profile] = await Promise.all([
      insertRoom(supabase),
      fetchUserProfile(supabase, user?.id),
    ]);

    // add redirect to old rom
    if (profile?.room_id) {
      await updateRoom(supabase, profile.room_id, { next_room_id: room.id });
    }

    // join room
    await addProfileToRoom(supabase, user?.id, room.id);

    const data = JSON.stringify({ room_id: room.id });
    return new Response(data, { headers, status: 200 });
  } catch (error) {
    const data = JSON.stringify({ error });
    return new Response(data, { headers, status: 400 });
  }
});
