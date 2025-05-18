import { MessageData } from "@/supabase/functions/_types/Database.type";
import { SupabaseClient } from "@supabase/supabase-js";

export const fetchMessages = async (
  supabase: SupabaseClient,
  gameId: string,
) => {
  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .eq("game_id", gameId);

  if (error) {
    console.error("Error fetching messages:", error);
    return [];
  } else {
    return data as MessageData[];
  }
};

export const insertMessage = async (
  supabase: SupabaseClient,
  message: Partial<MessageData>,
) => {
  const insertMessageResponse = await supabase
    .from("messages")
    .insert([message]);
  if (insertMessageResponse.error) {
    throw new Error(
      "Error inserting message: " + insertMessageResponse.error.message,
    );
  }
};
