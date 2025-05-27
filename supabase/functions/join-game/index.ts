import { headers } from "../_utils/cors.ts";
import { createSupabaseClient } from "../_utils/supabase.ts";
import { createErrorResponse } from "../_utils/error.ts";
import {
  addPlayerToGame,
  fetchGameAndCheckStatus,
} from "../_queries/game.query.ts";
import {
  fetchProfile,
  updateProfileGameId,
} from "../_queries/profiles.query.ts";
import { postSystemMessage } from "../_queries/messages.query.ts";
import { getTranslationFunction } from "../_shared/i18n.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers });
  }

  try {
    const { gameId } = (await req.json()) as {
      gameId: string;
    };
    if (!gameId) throw new Error("Missing gameId");
    console.log("Joining game", { gameId });

    const supabase = createSupabaseClient(req);

    // Check that game exists and is in lobby status
    const game = await fetchGameAndCheckStatus(supabase, gameId, [
      "lobby",
      "talking_warmup",
      "talking_hunt",
      "voting",
    ]);

    const userResponse = await supabase.auth.getUser();
    if (userResponse.error) {
      throw new Error(userResponse.error.message);
    }
    const user = userResponse.data.user;

    // Get user profile to get name
    const profile = await fetchProfile(supabase, user.id);

    // Update profile to join the game
    await updateProfileGameId(supabase, user.id, gameId);

    // Add player to game.players array
    await addPlayerToGame(supabase, gameId, {
      id: user.id,
      name: profile.name || "Unknown",
      vote: null,
      vote_blank: false,
      is_bot: false,
      score: 0,
    });

    if (game.status !== "lobby") {
      const t = getTranslationFunction(game.lang);
      postSystemMessage(
        supabase,
        gameId,
        t("messages.joinedGame", { player: profile.name }),
      );
    }

    const data = JSON.stringify({ profileId: user.id, gameId });
    return new Response(data, { headers, status: 200 });
  } catch (error) {
    return createErrorResponse(error);
  }
});
