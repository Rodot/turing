import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabase/client";

export type Message = {
  id: number;
  created_at: string;
  user_id: string;
  author: string;
  content: string;
};

export function useMessages(): Message[] {
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    fetchMessages();

    const channel = supabase
      .channel("messages")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        (payload) => {
          console.log("Change received!", payload.new);
          setMessages((prevMessages) =>
            [...prevMessages, payload.new as Message].sort((a, b) =>
              a.created_at.localeCompare(b.created_at)
            )
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchMessages = async () => {
    const { data, error } = await supabase.from("messages").select("*");

    if (error) {
      console.error("Error fetching messages:", error);
    } else {
      setMessages(data);
    }
  };

  return messages;
}
