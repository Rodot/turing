import { SupabaseClient } from "https://esm.sh/v135/@supabase/supabase-js@2.43.2/dist/module/index.js";
import { MessageData } from "../_types/Database.type.ts";

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

export const postSystemMessage = async (
  supabase: SupabaseClient,
  gameId: string,
  message: string,
) => {
  await insertMessage(supabase, {
    author_name: "",
    type: "system",
    content: message,
    game_id: gameId,
  });
  await new Promise((resolve) => setTimeout(resolve, 3000));
};

export const postIcebreakerMessage = async (
  supabase: SupabaseClient,
  gameId: string,
  message: string,
) => {
  await insertMessage(supabase, {
    author_name: "",
    type: "icebreaker",
    content: "💡 " + message,
    game_id: gameId,
  });
};
