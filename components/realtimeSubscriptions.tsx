"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/utils/supabase/client";
import { useGameIdFromUrl } from "./gameIdProvider";

export const RealtimeSubscriptions: React.FC = () => {
  const queryClient = useQueryClient();
  const gameIdFromUrl = useGameIdFromUrl();

  useEffect(() => {
    if (!gameIdFromUrl) return;

    // Game subscription
    const gameChannel = supabase
      .channel(`game-${gameIdFromUrl}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "games",
          filter: `id=eq.${gameIdFromUrl}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["game", gameIdFromUrl] });
        }
      )
      .subscribe();

    // Messages subscription
    const messagesChannel = supabase
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
          queryClient.invalidateQueries({
            queryKey: ["messages", gameIdFromUrl],
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(gameChannel);
      supabase.removeChannel(messagesChannel);
    };
  }, [gameIdFromUrl, queryClient]);

  return null; // This component doesn't render anything
};
