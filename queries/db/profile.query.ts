import { ProfileData } from "@/supabase/functions/_types/Database.type";
import { SupabaseClient } from "@supabase/supabase-js";

export const updateProfileName = async (
  supabase: SupabaseClient,
  userId: string,
  name: string,
) => {
  const req = await supabase
    .from("profiles")
    .update([{ name }])
    .eq("id", userId);
  if (req.error) {
    throw new Error(req.error.message);
  }
};

export const updateProfileGame = async (
  supabase: SupabaseClient,
  userId: string,
  gameId: string,
) => {
  const req = await supabase
    .from("profiles")
    .update([{ game_id: gameId }])
    .eq("id", userId);
  if (req.error) {
    throw new Error(req.error.message);
  }
};

export const fetchGameProfiles = async (
  supabase: SupabaseClient,
  gameId: string,
): Promise<ProfileData[]> => {
  const req = await supabase.from("profiles").select("*").eq("game_id", gameId);
  if (req.error) {
    throw new Error(req.error.message);
  } else {
    const gameUsers = req?.data;
    return gameUsers ?? [];
  }
};

export const fetchUserProfile = async (
  supabase: SupabaseClient,
  userId: string,
): Promise<ProfileData> => {
  const req = await supabase.from("profiles").select("*").eq("id", userId);
  if (req.error) {
    throw new Error(req.error.message);
  } else {
    const profile = req?.data?.[0];
    return profile;
  }
};
