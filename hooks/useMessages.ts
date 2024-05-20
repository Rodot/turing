import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabase/client";
import { fetchMessages } from "@/queries/db/messages.query";
import { MessageData } from "@/supabase/functions/_types/Database.type";

export function useMessages(roomId: string | null): MessageData[] {
  const [messages, setMessages] = useState<MessageData[]>([]);

  const updateMessages = async (roomId: string) => {
    const messages = await fetchMessages(supabase, roomId);
    setMessages(messages);
    return;
  };

  useEffect(() => {
    if (!roomId) return;
    updateMessages(roomId);

    const channel = supabase
      .channel("messages" + roomId)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: "room_id=eq." + roomId,
        },
        (payload) => {
          setMessages((prevMessages) => [
            ...prevMessages,
            payload.new as MessageData,
          ]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomId]);

  return messages;
}
