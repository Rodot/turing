"use client";

import { GameData } from "@/supabase/functions/_types/Database.type";
import { supabase } from "@/utils/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchGame } from "@/queries/db/game.query";
import { useRouter } from "next/navigation";
import { useGameIdFromUrl } from "../components/gameIdProvider";
import { useEffect, useRef } from "react";

export const useGameQuery = () => {
  const queryClient = useQueryClient();
  const gameIdFromUrl = useGameIdFromUrl();
  const router = useRouter();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const query = useQuery({
    queryKey: ["game", gameIdFromUrl],
    queryFn: async (): Promise<GameData | undefined> => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ["game", gameIdFromUrl] });
      }, 10000);

      if (!gameIdFromUrl) return undefined;
      try {
        const game = await fetchGame(supabase, gameIdFromUrl);
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
          event: "UPDATE",
          schema: "public",
          table: "games",
          filter: `id=eq.${gameIdFromUrl}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["game", gameIdFromUrl] });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [gameIdFromUrl, queryClient]);

  return query;
};
