import { createClient } from "https://esm.sh/v135/@supabase/supabase-js@2.43.2/dist/module/index.js";

export const createSupabaseClient = (req: Request) => {
  const Authorization = req.headers.get("Authorization");
  if (!Authorization) throw new Error("Missing Authorization header");
  return createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? "",
    {
      global: {
        headers: { Authorization },
      },
    },
  );
};
