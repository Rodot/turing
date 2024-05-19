import { Profile } from "@/types/Database.type";
import { supabase } from "@/utils/supabase/client";

export const addUserToRoomContext = async (userId: string, roomId: string) => {
  const req = await supabase
    .from("profiles")
    .update([{ room_id: roomId }])
    .eq("id", userId);
  if (req.error) {
    throw new Error(req.error.message);
  }
};

export const removeUserFromRoomContext = async (userId: string) => {
  const req = await supabase
    .from("profiles")
    .update([{ room_id: null }])
    .eq("id", userId);
  if (req.error) {
    throw new Error(req.error.message);
  }
};

export const fetchRoomContextProfiles = async (
  room: string
): Promise<Profile[]> => {
  const req = await supabase.from("profiles").select("*").eq("room_id", room);
  if (req.error) {
    throw new Error(req.error.message);
  } else {
    const roomUsers = req?.data;
    return roomUsers ?? [];
  }
};

export const fetchProfile = async (userId: string): Promise<Profile> => {
  const req = await supabase.from("profiles").select("*").eq("id", userId);
  if (req.error) {
    throw new Error(req.error.message);
  } else {
    const profile = req?.data?.[0];
    return profile;
  }
};
