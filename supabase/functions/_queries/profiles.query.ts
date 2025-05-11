import { SupabaseClient } from "https://esm.sh/v135/@supabase/supabase-js@2.43.2/dist/module/index.js";
import { ProfileData } from "../_types/Database.type.ts";

export const addProfileToRoom = async (
  supabase: SupabaseClient,
  userId: string,
  roomId: string,
) => {
  const req = await supabase
    .from("profiles")
    .update([{ room_id: roomId }])
    .eq("id", userId);
  if (req.error) {
    throw new Error(req.error.message);
  }
};

export const removeProfileFromRoom = async (
  supabase: SupabaseClient,
  userId: string,
) => {
  const req = await supabase
    .from("profiles")
    .update([{ room_id: null }])
    .eq("id", userId);
  if (req.error) {
    throw new Error(req.error.message);
  }
};

export const fetchRoomProfiles = async (
  supabase: SupabaseClient,
  roomId: string,
): Promise<ProfileData[]> => {
  const req = await supabase.from("profiles").select("*").eq("room_id", roomId);
  if (req.error) {
    throw new Error(req.error.message);
  } else {
    const roomUsers = req?.data;
    return roomUsers ?? [];
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
