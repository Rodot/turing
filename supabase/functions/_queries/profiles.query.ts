import { SupabaseClient } from "https://esm.sh/v135/@supabase/supabase-js@2.43.2/dist/module/index.js";

export const fetchProfile = async (supabase: SupabaseClient, id: string) => {
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("name")
    .eq("id", id)
    .single();

  if (error) throw new Error(error.message);
  return profile;
};

export const updateProfileGameId = async (
  supabase: SupabaseClient,
  profileId: string,
  gameId: string | null,
) => {
  const { error } = await supabase
    .from("profiles")
    .update({ game_id: gameId })
    .eq("id", profileId);

  if (error) throw new Error(error.message);
};

export const removeAllPlayersFromGame = async (
  supabase: SupabaseClient,
  gameId: string,
) => {
  const { error } = await supabase
    .from("profiles")
    .update({ game_id: null })
    .eq("game_id", gameId);

  if (error) {
    throw new Error("Error removing profiles: " + error.message);
  }
};
