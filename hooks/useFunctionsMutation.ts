"use client";

import { MessageData } from "@/supabase/functions/_types/Database.type";
import { supabase } from "@/utils/supabase/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useGameIdFromUrl } from "./useGameIdFromUrl";
import { useProfileQuery } from "./useProfileQuery";
import { useRouter } from "next/navigation";
import { extractSupabaseError } from "@/utils/supabase/errorHandling";

export const useStartGameMutation = () => {
  const gameIdFromUrl = useGameIdFromUrl();

  return useMutation({
    mutationFn: async () => {
      if (!gameIdFromUrl) throw new Error("No game joined");
      const response = await supabase.functions.invoke("start-game", {
        body: { gameId: gameIdFromUrl },
      });
      if (response.error) {
        const errorMessage = await extractSupabaseError(
          response,
          "Error starting game",
        );
        throw new Error(errorMessage);
      }
      return { gameId: gameIdFromUrl };
    },
  });
};

export const useCreateGameMutation = () => {
  const queryClient = useQueryClient();
  const profileQuery = useProfileQuery();
  const profile = profileQuery.data;
  const router = useRouter();

  return useMutation({
    mutationFn: async () => {
      const response = await supabase.functions.invoke("create-game");
      if (response.error) {
        console.error(response.error);
        const errorMessage = await extractSupabaseError(
          response,
          "Error creating game",
        );
        throw new Error(errorMessage);
      }
      return response?.data?.game_id as string | undefined;
    },
    onSuccess: (gameId) => {
      if (gameId && profile?.id) {
        queryClient.invalidateQueries({ queryKey: ["profile", profile.id] });
        router.push(`/?game=${gameId}`);
      }
    },
  });
};

export const usePlayerVoteMutation = () => {
  return useMutation({
    mutationFn: async (params: {
      gameId: string;
      profileId: string;
      vote: string;
    }) => {
      const response = await supabase.functions.invoke("player-vote", {
        body: params,
      });
      if (response.error) {
        console.error(response.error);
        const errorMessage = await extractSupabaseError(
          response,
          "Error voting",
        );
        throw new Error(errorMessage);
      }
      return params;
    },
  });
};

export const usePostMessageMutation = () => {
  return useMutation({
    mutationFn: async (message: Partial<MessageData>) => {
      const response = await supabase.functions.invoke("post-message", {
        body: message,
      });
      if (response.error) {
        console.error(response.error);
        const errorMessage = await extractSupabaseError(
          response,
          "Error posting message",
        );
        throw new Error(errorMessage);
      }
      return message;
    },
  });
};

export const useEndGameMutation = () => {
  const queryClient = useQueryClient();
  const profileQuery = useProfileQuery();
  const userId = profileQuery.data?.id;

  return useMutation({
    mutationFn: async (gameId: string) => {
      const response = await supabase.functions.invoke("end-game", {
        body: { gameId },
      });
      if (response.error) {
        console.error(response.error);
        const errorMessage = await extractSupabaseError(
          response,
          "Error ending game",
        );
        throw new Error(errorMessage);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile", userId] });
    },
  });
};

export const useStartVoteMutation = () => {
  return useMutation({
    mutationFn: async (gameId: string) => {
      const response = await supabase.functions.invoke("start-vote", {
        body: { gameId },
      });
      if (response.error) {
        console.error(response.error);
        const errorMessage = await extractSupabaseError(
          response,
          "Error starting vote",
        );
        throw new Error(errorMessage);
      }
    },
  });
};

export const useGenerateAnswersMutation = () => {
  return useMutation({
    mutationFn: async (params: {
      gameId: string;
      playerName: string;
      lang: "en" | "fr";
    }) => {
      const { gameId, playerName, lang } = params;
      if (!gameId) throw new Error("No game joined");
      const response = await supabase.functions.invoke("generate-answers", {
        body: { gameId, playerName, lang },
      });
      if (response.error) {
        console.error(response.error);
        const errorMessage = await extractSupabaseError(
          response,
          "Error generating answers",
        );
        throw new Error(errorMessage);
      }
      return response?.data;
    },
  });
};

export const useJoinGameMutation = () => {
  const queryClient = useQueryClient();
  const profileQuery = useProfileQuery();
  const profile = profileQuery.data;

  return useMutation({
    mutationFn: async (gameId: string) => {
      if (!profile?.id) throw new Error("User not authenticated");
      const response = await supabase.functions.invoke("join-game", {
        body: { gameId },
      });
      if (response.error) {
        console.error(response);
        const errorMessage = await extractSupabaseError(
          response,
          "Error joining game",
        );
        throw new Error(errorMessage);
      }
      return { profileId: profile.id, gameId };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["profile", data.profileId] });
    },
  });
};
