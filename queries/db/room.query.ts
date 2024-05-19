import { RoomData } from "@/types/Database.type";
import { SupabaseClient } from "@supabase/supabase-js";

export const fetchRoom = async (supabase: SupabaseClient, id: string) => {
  const req = await supabase.from("rooms").select("*").eq("id", id);
  if (req.error) {
    throw new Error(req.error.message);
  } else {
    const room: RoomData = req?.data?.[0] ?? null;
    return room;
  }
};

export const insertRoom = async (supabase: SupabaseClient, id: string) => {
  const req = await supabase.from("rooms").insert([{ id }]);
  if (req.error) {
    throw new Error(req.error.message);
  }
};

export const updateRoom = async (
  supabase: SupabaseClient,
  id: string,
  data: RoomData
) => {
  const req = await supabase.from("rooms").update(data).eq("id", id);
  if (req.error) {
    throw new Error(req.error.message);
  }
};
