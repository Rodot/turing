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

// Functions migrated from players.query.ts
export const fetchProfiles = async (
  supabase: SupabaseClient,
  gameId: string,
) => {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("game_id", gameId)
    .order("created_at", { ascending: true });

  if (error) throw new Error("Error fetching profiles:" + error.message);
  return data as ProfileData[];
};

export const fetchProfile = async (
  supabase: SupabaseClient,
  profileId: string,
) => {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", profileId)
    .single();
  if (error) throw new Error("Error fetching profile:" + error.message);
  return data as ProfileData;
};

export const deleteProfile = async (
  supabase: SupabaseClient,
  profileId: string,
) => {
  const deleteResponse = await supabase
    .from("profiles")
    .delete()
    .eq("id", profileId);
  if (deleteResponse.error) {
    throw new Error("Error deleting profile: " + deleteResponse.error.message);
  }
};

export const insertProfiles = async (
  supabase: SupabaseClient,
  profiles: Partial<ProfileData>[],
) => {
  const insertProfileResponse = await supabase
    .from("profiles")
    .insert(profiles);
  if (insertProfileResponse.error) {
    throw new Error(
      "Error inserting profile: " + insertProfileResponse.error.message,
    );
  }
};

export const updateProfile = async (
  supabase: SupabaseClient,
  profile: Partial<ProfileData>,
) => {
  const updateResponse = await supabase
    .from("profiles")
    .update(profile)
    .eq("id", profile.id);

  if (updateResponse.error) {
    throw new Error("Error updating profile: " + updateResponse.error.message);
  }
};

export const updateGameProfiles = async (
  supabase: SupabaseClient,
  profile: Partial<ProfileData>,
) => {
  const updateResponse = await supabase
    .from("profiles")
    .update(profile)
    .eq("game_id", profile.game_id);

  if (updateResponse.error) {
    throw new Error(
      "Error updating game profiles: " + updateResponse.error.message,
    );
  }
};
