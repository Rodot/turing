// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
/// <reference types="https://esm.sh/@supabase/functions-js@2.4.4/src/edge-runtime.d.ts" />

import {
  fetchGameAndCheckStatus,
  updatePlayerInGame,
} from "../_queries/game.query.ts";
import { headers } from "../_utils/cors.ts";
import { createSupabaseClient } from "../_utils/supabase.ts";
import { createErrorResponse } from "../_utils/error.ts";
import { checkIfAllPlayersVoted } from "../_utils/check-if-all-players-voted.ts";
import { endVotingPhase } from "../_utils/end-voting-phase.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers });
  }

  try {
    const { gameId, profileId, vote } = (await req.json()) as {
      gameId: string;
      profileId: string;
      vote: string;
    };
    if (!gameId) throw new Error("Missing gameId");
    if (!profileId) throw new Error("Missing profileId");
    if (!vote) throw new Error("Missing vote");

    const supa = createSupabaseClient(req);
    console.log("Voting", { gameId, profileId });

    // Check that game is in voting status
    await fetchGameAndCheckStatus(supa, gameId, "voting");

    // Apply player vote
    if (vote === "blank") {
      await updatePlayerInGame(supa, gameId, profileId, {
        vote: null,
        vote_blank: true,
      });
    } else {
      await updatePlayerInGame(supa, gameId, profileId, {
        vote,
        vote_blank: false,
      });
    }

    const gameAfterVote = await fetchGameAndCheckStatus(supa, gameId, "voting");

    // Process voting if all players have voted
    const allVoted = checkIfAllPlayersVoted(gameAfterVote);
    if (allVoted) {
      console.log("All players have voted", gameId);
      await endVotingPhase(supa, gameAfterVote);
    }

    const data = JSON.stringify({});
    return new Response(data, { headers, status: 200 });
  } catch (error) {
    return createErrorResponse(error);
  }
});
