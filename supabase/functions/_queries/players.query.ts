import { SupabaseClient } from "https://esm.sh/v135/@supabase/supabase-js@2.43.2/dist/module/index.js";
import { PlayerData, PlayerDataInsert } from "../_types/Database.type.ts";

export const fetchPlayers = async (
  supabase: SupabaseClient,
  roomId: string
) => {
  const req = await supabase.from("players").select("*").eq("room_id", roomId);

  if (req.error) {
    console.error("Error fetching players:", req.error);
    return [];
  } else {
    return req.data as PlayerData[];
  }
};

export const insertPlayers = async (
  supabase: SupabaseClient,
  players: PlayerDataInsert[]
) => {
  const req = await supabase.from("players").insert(players);
  if (req.error) {
    throw new Error("Error inserting message: " + req.error.message);
  }
};
