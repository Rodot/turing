import { SupabaseClient } from "https://esm.sh/v135/@supabase/supabase-js@2.43.2/dist/module/index.js";
import { RoomData } from "../_types/Database.type.ts";

export const fetchRoom = async (supabase: SupabaseClient, id: string) => {
  const req = await supabase.from("rooms").select("*").eq("id", id);
  if (req.error) {
    throw new Error(req.error.message);
  }
  const room: RoomData | null = req?.data?.[0] ?? null;
  return room;
};

export const insertRoom = async (supabase: SupabaseClient) => {
  const req = await supabase.from("rooms").insert({}).select();
  if (req.error) {
    throw new Error(req.error.message);
  }
  const room: RoomData = req?.data?.[0];
  return room;
};

export const updateRoom = async (
  supabase: SupabaseClient,
  id: string,
  data: Partial<RoomData>
) => {
  const req = await supabase.from("rooms").update(data).eq("id", id);
  if (req.error) {
    throw new Error(req.error.message);
  }
};
