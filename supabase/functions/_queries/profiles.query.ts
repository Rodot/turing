import { SupabaseClient } from "https://esm.sh/v135/@supabase/supabase-js@2.43.2/dist/module/index.js";
import { ProfileData } from "../_types/Database.type.ts";

export const addProfileToGame = async (
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

export const removeProfileFromGame = async (
  supabase: SupabaseClient,
  userId: string,
) => {
  const req = await supabase
    .from("profiles")
    .update([{ game_id: null }])
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
