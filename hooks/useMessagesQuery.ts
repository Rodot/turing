"use client";

import { MessageData } from "@/supabase/functions/_types/Database.type";
import { supabase } from "@/utils/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useGameId } from "./useGameId";
import { fetchMessages } from "@/queries/db/messages.query";
import { useEffect } from "react";

export const useMessagesQuery = () => {
  const queryClient = useQueryClient();
  const gameId = useGameId();

  const query = useQuery({
    queryKey: ["messages", gameId],
    queryFn: async (): Promise<MessageData[]> => {
      if (!gameId) return [];
      const messages = await fetchMessages(supabase, gameId);
      return messages;
    },
    enabled: !!gameId,
  });

  // Set up real-time subscription
  useEffect(() => {
    if (!gameId) return;

    const channel = supabase
      .channel(`messages-${gameId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "messages",
          filter: `game_id=eq.${gameId}`,
        },
        () => {
          // Invalidate query when changes detected
          queryClient.invalidateQueries({ queryKey: ["messages", gameId] });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [gameId, queryClient]);

  return query;
};
