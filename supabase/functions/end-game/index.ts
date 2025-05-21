import { updateGame } from "../_queries/game.query.ts";
import { insertMessage } from "../_queries/messages.query.ts";
import { headers } from "../_utils/cors.ts";
import { createSupabaseClient } from "../_utils/supabase.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers });
  }

  try {
    const { gameId } = (await req.json()) as {
      gameId: string;
    };
    if (!gameId) throw new Error("Missing gameId");

    const supabase = createSupabaseClient(req);
    console.log("Ending game", { gameId });

    // Post a message
    await insertMessage(supabase, {
      author: "system",
      content: "❌ Game ended by a player",
      game_id: gameId,
    });

    // Remove all players from the game
    const { error: removeProfilesError } = await supabase
      .from("profiles")
      .update({ game_id: null })
      .eq("game_id", gameId);

    if (removeProfilesError) {
      throw new Error(
        "Error removing profiles: " + removeProfilesError.message,
      );
    }

    // Set the game status to "over"
    await updateGame(supabase, gameId, { status: "over" });

    const data = JSON.stringify({});
    return new Response(data, { headers, status: 200 });
  } catch (error) {
    console.error(error);
    const data = JSON.stringify({ error });
    return new Response(data, { headers, status: 400 });
  }
});
