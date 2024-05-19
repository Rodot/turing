import { supabase } from "@/utils/supabase/client";

export const fetchMessages = async (roomId: string) => {
  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .eq("room_id", roomId);

  if (error) {
    console.error("Error fetching messages:", error);
    return [];
  } else {
    return data;
  }
};
