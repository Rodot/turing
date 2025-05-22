import { updateGame } from "../_queries/game.query.ts";
import { insertMessage } from "../_queries/messages.query.ts";
import { fetchProfile } from "../_queries/profiles.query.ts";
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
    console.log("Starting vote", { gameId });

    const supabase = createSupabaseClient(req);
    const userResponse = await supabase.auth.getUser();
    if (userResponse.error) {
      throw new Error(userResponse.error.message);
    }
    const user = userResponse.data.user;
    const profile = await fetchProfile(supabase, user.id);

    // Post a message
    await insertMessage(supabase, {
      author: "system",
      content: `🗳️ ${profile.name} started a vote`,
      game_id: gameId,
    });

    await new Promise((resolve) => setTimeout(resolve, 3000));

    // Set the game status to "voting"
    await updateGame(supabase, gameId, { status: "voting" });

    const data = JSON.stringify({});
    return new Response(data, { headers, status: 200 });
  } catch (error) {
    console.error(error);
    const data = JSON.stringify({ error });
    return new Response(data, { headers, status: 400 });
  }
});
