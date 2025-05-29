"use client";

import { GameData } from "@/supabase/functions/_types/Database.type";
import { supabase } from "@/utils/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { fetchGame } from "@/queries/db/game.query";
import { useRouter } from "next/navigation";
import { useGameIdFromUrl } from "../components/gameIdProvider";

export const useGameQuery = () => {
  const gameIdFromUrl = useGameIdFromUrl();

  const router = useRouter();

  const query = useQuery({
    queryKey: ["game", gameIdFromUrl],
    queryFn: async (): Promise<GameData | undefined> => {
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

  return query;
};
