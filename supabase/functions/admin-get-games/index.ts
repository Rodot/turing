import { headers } from "../_utils/cors.ts";
import { createSupabaseClient } from "../_utils/supabase.ts";
import { createErrorResponse } from "../_utils/error.ts";
import { fetchAllGames } from "../_queries/game.query.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers });
  }

  try {
    const supabase = createSupabaseClient(req);

    const games = await fetchAllGames(supabase);

    return new Response(JSON.stringify(games), {
      headers,
      status: 200,
    });
  } catch (error) {
    return createErrorResponse(error);
  }
});
