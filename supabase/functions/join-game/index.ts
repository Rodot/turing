import { headers } from "../_utils/cors.ts";
import { createSupabaseClient } from "../_utils/supabase.ts";
import { addPlayerToGame } from "../_queries/game.query.ts";

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

    const userResponse = await supabase.auth.getUser();
    if (userResponse.error) {
      throw new Error(userResponse.error.message);
    }
    const user = userResponse.data.user;

    // Get user profile to get name
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("name")
      .eq("id", user.id)
      .single();

    if (profileError) throw new Error(profileError.message);

    // Update profile to join the game
    const { error: updateError } = await supabase
      .from("profiles")
      .update({ game_id: gameId })
      .eq("id", user.id);

    if (updateError) throw new Error(updateError.message);

    // Add player to game.players array
    await addPlayerToGame(supabase, gameId, {
      id: user.id,
      name: profile.name || "Unknown",
      vote: null,
      vote_blank: false,
      is_bot: false,
      score: 0,
    });

    const data = JSON.stringify({ profileId: user.id, gameId });
    return new Response(data, { headers, status: 200 });
  } catch (error) {
    console.error(error);
    const data = JSON.stringify({ error });
    return new Response(data, { headers, status: 400 });
  }
});
