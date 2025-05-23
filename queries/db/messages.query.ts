import { MessageData } from "@/supabase/functions/_types/Database.type";
import { SupabaseClient } from "@supabase/supabase-js";

export const fetchMessages = async (
  supabase: SupabaseClient,
  gameId: string,
) => {
  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .eq("game_id", gameId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Error fetching messages:", error);
    return [];
  } else {
    return data as MessageData[];
  }
};
