"use client";

import { supabase } from "@/utils/supabase/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useProfileQuery } from "./useProfileQuery";
import { updateProfileGame } from "@/queries/db/profile.query";
import { updateGame } from "@/queries/db/game.query";
import { useGameIdFromUrl } from "./useGameIdFromUrl";

export { useCreateGameMutation } from "@/hooks/useFunctionsMutation";

export const useJoinGameMutation = () => {
  const queryClient = useQueryClient();
  const profileQuery = useProfileQuery();
  const profile = profileQuery.data;

  return useMutation({
    mutationFn: async (gameId: string) => {
      if (!profile?.id) throw new Error("User not authenticated");
      await updateProfileGame(supabase, profile.id, gameId);
      return { profileId: profile.id, gameId };
    },
    onSuccess: (data) => {
      // Invalidate profile query to trigger a refetch
      queryClient.invalidateQueries({ queryKey: ["profile", data.profileId] });
    },
  });
};

export const useGameLanguageMutation = () => {
  const gameId = useGameIdFromUrl();

  return useMutation({
    mutationFn: async (lang: "en" | "fr") => {
      if (!gameId) throw new Error("No game joined");
      await updateGame(supabase, gameId, { lang });
      return { gameId };
    },
    // don't invalidate the game query, as it will be done by the subscription
  });
};
