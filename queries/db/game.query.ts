import { GameData } from "@/supabase/functions/_types/Database.type";
import { SupabaseClient } from "@supabase/supabase-js";

export const fetchGame = async (supabase: SupabaseClient, id: string) => {
  const req = await supabase.from("games").select("*").eq("id", id);
  if (req.error) {
    throw new Error(req.error.message);
  }
  const game: GameData | null = req?.data?.[0] ?? null;
  return game;
};

export const insertGame = async (supabase: SupabaseClient) => {
  const req = await supabase.from("games").insert({}).select();
  if (req.error) {
    throw new Error(req.error.message);
  }
  const game: GameData = req?.data?.[0];
  return game;
};

export const updateGame = async (
  supabase: SupabaseClient,
  id: string,
  data: Partial<GameData>,
) => {
  const req = await supabase.from("games").update(data).eq("id", id);
  if (req.error) {
    throw new Error(req.error.message);
  }
};
