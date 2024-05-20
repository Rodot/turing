import { SupabaseClient } from "https://esm.sh/v135/@supabase/supabase-js@2.43.2/dist/module/index.js";
import { PlayerData, PlayerDataInsert } from "../_types/Database.type.ts";
export const fetchPlayers = async (
  supabase: SupabaseClient,
  roomId: string
) => {
  const { data, error } = await supabase
    .from("players")
    .select("*")
    .eq("room_id", roomId);

  if (error) {
    console.error("Error fetching players:", error);
    return [];
  } else {
    return data as PlayerData[];
  }
};

export const insertPlayers = async (
  supabase: SupabaseClient,
  players: PlayerDataInsert[]
) => {
  const insertPlayerResponse = await supabase.from("players").insert(players);
  if (insertPlayerResponse.error) {
    throw new Error(
      "Error inserting player: " + insertPlayerResponse.error.message
    );
  }
};

export const updatePlayer = async (
  supabase: SupabaseClient,
  player: Partial<PlayerData> & { id: string }
) => {
  const updateResponse = await supabase
    .from("players")
    .update(player)
    .eq("id", player.id);

  if (updateResponse.error) {
    throw new Error("Error updating player: " + updateResponse.error.message);
  }
};

export const updateRoomPlayers = async (
  supabase: SupabaseClient,
  player: Partial<PlayerData> & { room_id: string }
) => {
  const updateResponse = await supabase
    .from("players")
    .update(player)
    .eq("room_id", player.room_id);

  if (updateResponse.error) {
    throw new Error(
      "Error updating room players: " + updateResponse.error.message
    );
  }
};
