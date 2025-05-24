// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
/// <reference types="https://esm.sh/@supabase/functions-js/src/edge-runtime.d.ts" />

import { addPlayerToGame, insertGame } from "../_queries/game.query.ts";
import {
  fetchProfile,
  updateProfileGameId,
} from "../_queries/profiles.query.ts";
import { headers } from "../_utils/cors.ts";
import { createSupabaseClient } from "../_utils/supabase.ts";
import { createErrorResponse } from "../_utils/error.ts";

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

    // Get user profile to get name
    const profile = await fetchProfile(supabase, user.id);

    // Create new game
    const game = await insertGame(supabase);

    // Update profile to join the game
    await updateProfileGameId(supabase, user.id, game.id);

    // Add player to game.players array
    await addPlayerToGame(supabase, game.id, {
      id: user.id,
      name: profile.name || "Unknown",
      vote: null,
      vote_blank: false,
      is_bot: false,
      score: 0,
    });

    const data = JSON.stringify({ game_id: game.id });
    return new Response(data, { headers, status: 200 });
  } catch (error) {
    return createErrorResponse(error);
  }
});
