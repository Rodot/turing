"use client";

import { PlayerData } from "@/supabase/functions/_types/Database.type";
import { supabase } from "@/utils/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useGameIdFromUrl } from "./useGameIdFromUrl";
import { fetchPlayers } from "@/queries/db/players.query";
import { useEffect } from "react";

export const usePlayersQuery = () => {
  const queryClient = useQueryClient();
  const gameIdFromUrl = useGameIdFromUrl();

  const query = useQuery({
    queryKey: ["players", gameIdFromUrl],
    queryFn: async (): Promise<PlayerData[]> => {
      if (!gameIdFromUrl) return [];
      const players = await fetchPlayers(supabase, gameIdFromUrl);
      return players;
    },
    enabled: !!gameIdFromUrl,
  });

  // Set up real-time subscription
  useEffect(() => {
    if (!gameIdFromUrl) return;

    const channel = supabase
      .channel(`players-${gameIdFromUrl}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "players",
          filter: `game_id=eq.${gameIdFromUrl}`,
        },
        () => {
          // Invalidate query when changes detected
          queryClient.invalidateQueries({
            queryKey: ["players", gameIdFromUrl],
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
