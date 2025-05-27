"use client";

import { GameData } from "@/supabase/functions/_types/Database.type";
import { supabase } from "@/utils/supabase/client";
import { useQuery } from "@tanstack/react-query";

export const useAllGamesQuery = () => {
  const query = useQuery({
    queryKey: ["allGames"],
    queryFn: async (): Promise<GameData[]> => {
      const { data, error } = await supabase.functions.invoke(
        "admin-get-games",
        {
          method: "GET",
        },
      );

      if (error) {
        throw new Error(error.message);
      }

      return data;
    },
  });

  return query;
};
