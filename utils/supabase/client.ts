import { createBrowserClient } from "@supabase/ssr";

const createClient = () => {
  if (!process.env["NEXT_PUBLIC_SUPABASE_URL"]) {
    throw new Error("Missing env.NEXT_PUBLIC_SUPABASE_URL");
  }
  if (!process.env["NEXT_PUBLIC_SUPABASE_ANON_KEY"]) {
    throw new Error("Missing env.NEXT_PUBLIC_SUPABASE_ANON_KEY");
  }

  return createBrowserClient(
    process.env["NEXT_PUBLIC_SUPABASE_URL"],
    process.env["NEXT_PUBLIC_SUPABASE_ANON_KEY"],
    {
      realtime: {
        heartbeatIntervalMs: 3000,
      },
    },
  );
};

export const supabase = createClient();
