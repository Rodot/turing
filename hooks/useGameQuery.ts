"use client";

import { GameData } from "@/supabase/functions/_types/Database.type";
import { supabase } from "@/utils/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchGame } from "@/queries/db/game.query";
import { useRouter } from "next/navigation";
import { useGameIdFromUrl } from "./useGameIdFromUrl";
import { useEffect } from "react";

export const useGameQuery = () => {
  const queryClient = useQueryClient();
  const gameIdFromUrl = useGameIdFromUrl();
  const router = useRouter();

  const query = useQuery({
    queryKey: ["game", gameIdFromUrl],
    queryFn: async (): Promise<GameData | undefined> => {
      if (!gameIdFromUrl) return undefined;
      try {
        const game = await fetchGame(supabase, gameIdFromUrl);
        console.log("gameQuery", game);
        if (!game) {
          throw new Error("Game not found");
        }
        return game;
      } catch (error) {
        router.push("/");
        throw new Error("Game not found");
      }
    },
    enabled: !!gameIdFromUrl,
  });

  // Set up real-time subscription
  useEffect(() => {
    if (!gameIdFromUrl) return;

    const channel = supabase
      .channel(`game-${gameIdFromUrl}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "games",
          filter: `id=eq.${gameIdFromUrl}`,
        },
        () => {
          // Invalidate query when changes detected
          queryClient.invalidateQueries({ queryKey: ["game", gameIdFromUrl] });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [gameIdFromUrl, queryClient]);

  return query;
};
