"use client";

import { MessageData } from "@/supabase/functions/_types/Database.type";
import { supabase } from "@/utils/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useGameIdFromUrl } from "./useGameIdFromUrl";
import { fetchMessages } from "@/queries/db/messages.query";
import { useEffect } from "react";

export const useMessagesQuery = () => {
  const queryClient = useQueryClient();
  const gameIdFromUrl = useGameIdFromUrl();

  const query = useQuery({
    queryKey: ["messages", gameIdFromUrl],
    queryFn: async (): Promise<MessageData[]> => {
      if (!gameIdFromUrl) return [];
      const messages = await fetchMessages(supabase, gameIdFromUrl);
      return messages;
    },
    enabled: !!gameIdFromUrl,
  });

  // Set up real-time subscription
  useEffect(() => {
    if (!gameIdFromUrl) return;

    const channel = supabase
      .channel(`messages-${gameIdFromUrl}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `game_id=eq.${gameIdFromUrl}`,
        },
        () => {
          // Invalidate query when changes detected
          queryClient.invalidateQueries({
            queryKey: ["messages", gameIdFromUrl],
          });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [gameIdFromUrl, queryClient]);

  return query;
};
