"use client";

import { supabase } from "@/utils/supabase/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateGame } from "@/queries/db/game.query";
import { useGameIdFromUrl } from "../components/gameIdProvider";

export const useGameLanguageMutation = () => {
  const queryClient = useQueryClient();
  const gameId = useGameIdFromUrl();

  return useMutation({
    mutationFn: async (lang: "en" | "fr") => {
      if (!gameId) throw new Error("No game joined");
      await updateGame(supabase, gameId, { lang });
      return { gameId };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["game", data.gameId] });
    },
  });
};
