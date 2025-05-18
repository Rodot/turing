"use client";

import { PlayerData } from "@/supabase/functions/_types/Database.type";
import { supabase } from "@/utils/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useGameId } from "./useGameId";
import { fetchPlayers } from "@/queries/db/players.query";
import { useEffect } from "react";

export const usePlayersQuery = () => {
  const queryClient = useQueryClient();
  const gameId = useGameId();

  const query = useQuery({
    queryKey: ["players", gameId],
    queryFn: async (): Promise<PlayerData[]> => {
      if (!gameId) return [];
      const players = await fetchPlayers(supabase, gameId);
      return players;
    },
    enabled: !!gameId,
  });

  // Set up real-time subscription
  useEffect(() => {
    if (!gameId) return;

    const channel = supabase
      .channel(`players-${gameId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "players",
          filter: `game_id=eq.${gameId}`,
        },
        () => {
          // Invalidate query when changes detected
          queryClient.invalidateQueries({ queryKey: ["players", gameId] });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [gameId, queryClient]);

  return query;
};
