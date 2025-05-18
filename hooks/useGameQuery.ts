"use client";

import { GameData } from "@/supabase/functions/_types/Database.type";
import { supabase } from "@/utils/supabase/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useProfileQuery } from "./useProfileQuery";
import { fetchGame } from "@/queries/db/game.query";
import {
  createGameFunction,
  startGameFunction,
} from "@/queries/functions/functions.query";
import {
  removeProfileFromGame,
  updateProfileGame,
} from "@/queries/db/profile.query";
import { updateGame } from "@/queries/db/game.query";
import { useRouter } from "next/navigation";
import { useGameId } from "./useGameId";
import { useEffect } from "react";

export const useGameQuery = () => {
  const queryClient = useQueryClient();
  const gameId = useGameId();

  const query = useQuery({
    queryKey: ["game", gameId],
    queryFn: async (): Promise<GameData | undefined> => {
      if (!gameId) return undefined;
      const game = await fetchGame(supabase, gameId);
      console.log("gameQuery", game);
      if (!game) {
        throw new Error("Game not found");
      }
      return game;
    },
    enabled: !!gameId,
  });

  // Set up real-time subscription
  useEffect(() => {
    if (!gameId) return;

    const channel = supabase
      .channel(`game-${gameId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "games",
          filter: `id=eq.${gameId}`,
        },
        () => {
          // Invalidate query when changes detected
          queryClient.invalidateQueries({ queryKey: ["game", gameId] });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [gameId, queryClient]);

  return query;
};

export const useCreateGameMutation = () => {
  const queryClient = useQueryClient();
  const profileQuery = useProfileQuery();
  const profile = profileQuery.data;
  const router = useRouter();

  return useMutation({
    mutationFn: async () => {
      return await createGameFunction(supabase);
    },
    onSuccess: (gameId) => {
      if (gameId && profile?.id) {
        // Join the created game
        updateProfileGame(supabase, profile.id, gameId);
        // Invalidate profile query to trigger a refetch
        queryClient.invalidateQueries({ queryKey: ["profile", profile.id] });
        router.push(`/?game=${gameId}`);
      }
    },
  });
};

export const useJoinGameMutation = () => {
  const queryClient = useQueryClient();
  const profileQuery = useProfileQuery();
  const profile = profileQuery.data;
  const router = useRouter();

  return useMutation({
    mutationFn: async (gameId: string) => {
      if (!profile?.id) throw new Error("User not authenticated");
      await updateProfileGame(supabase, profile.id, gameId);
      return { profileId: profile.id, gameId };
    },
    onSuccess: (data) => {
      // Invalidate profile query to trigger a refetch
      queryClient.invalidateQueries({ queryKey: ["profile", data.profileId] });
      router.push(`/?game=${data.gameId}`);
    },
  });
};

export const useLeaveGameMutation = () => {
  const queryClient = useQueryClient();
  const profileQuery = useProfileQuery();
  const profile = profileQuery.data;
  const router = useRouter();

  return useMutation({
    mutationFn: async () => {
      if (!profile?.id) throw new Error("User not authenticated");
      await removeProfileFromGame(supabase, profile.id);
      return { profileId: profile.id };
    },
    onSuccess: (data) => {
      // Invalidate profile query to trigger a refetch
      queryClient.invalidateQueries({ queryKey: ["profile", data.profileId] });
      router.push(`/`);
    },
  });
};

export const useStartGameMutation = () => {
  const profileQuery = useProfileQuery();
  const profile = profileQuery.data;
  const gameId = profile?.game_id;

  return useMutation({
    mutationFn: async () => {
      if (!gameId) throw new Error("No game joined");
      await startGameFunction(supabase, gameId);
      return { gameId };
    },
    // don't invalidate the game query, as it will be done by the subscription
  });
};

export const useGameLanguageMutation = () => {
  const gameId = useGameId();

  return useMutation({
    mutationFn: async (lang: "en" | "fr") => {
      if (!gameId) throw new Error("No game joined");
      await updateGame(supabase, gameId, { lang });
      return { gameId };
    },
    // don't invalidate the game query, as it will be done by the subscription
  });
};
