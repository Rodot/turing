// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
/// <reference types="https://esm.sh/@supabase/functions-js/src/edge-runtime.d.ts" />

import {
  fetchGameProfiles,
  updateProfile,
} from "../_queries/profiles.query.ts";
import { fetchGame, updateGame } from "../_queries/game.query.ts";
import { headers } from "../_utils/cors.ts";
import { createSupabaseClient } from "../_utils/supabase.ts";
import { insertMessage } from "../_queries/messages.query.ts";
import { pickRandom } from "../_shared/utils.ts";
import { iceBreakers } from "../_shared/lang.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers });
  }

  try {
    const { gameId }: { gameId: string } = await req.json();
    if (!gameId) throw new Error("Missing gameId");
    console.log("Starting game", gameId);

    const supabase = createSupabaseClient(req);

    // fetch game
    const game = await fetchGame(supabase, gameId);
    if (!game) throw new Error("Game not found");

    // fetch profiles
    const profiles = await fetchGameProfiles(supabase, gameId);
    if (!profiles?.length) throw new Error("No profiles in game");

    // Select random profile to be the bot

    const noBotThisRound = Math.random() <= 1 / (profiles.length + 1);
    const botProfile = noBotThisRound ? undefined : pickRandom(profiles);

    // Update each profile with initial game values
    for (const profile of profiles) {
      await updateProfile(supabase, {
        id: profile.id,
        vote: null,
        vote_blank: false,
        is_bot: profile.id === botProfile?.id,
        score: 0,
      });
    }

    await insertMessage(supabase, {
      game_id: gameId,
      author: "intro",
      content: "💡 " + pickRandom(iceBreakers[game.lang]),
    });

    // start the game
    await updateGame(supabase, gameId, {
      status: "talking",
    });

    const data = JSON.stringify({});
    return new Response(data, { headers, status: 200 });
  } catch (error) {
    console.error(error);
    const data = JSON.stringify({ error });
    return new Response(data, { headers, status: 400 });
  }
});
