import { updateProfile } from "../_queries/profiles.query.ts";
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
    console.log("Joining game", { gameId });

    const supabase = createSupabaseClient(req);

    const userResponse = await supabase.auth.getUser();
    if (userResponse.error) {
      throw new Error(userResponse.error.message);
    }
    const user = userResponse.data.user;
    const profile = await fetchProfile(supabase, user.id);

    // Update the profile to join the game
    await updateProfile(supabase, { id: profile.id, game_id: gameId });

    const data = JSON.stringify({ profileId: profile.id, gameId });
    return new Response(data, { headers, status: 200 });
  } catch (error) {
    console.error(error);
    const data = JSON.stringify({ error });
    return new Response(data, { headers, status: 400 });
  }
});
