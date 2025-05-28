"use client";

import { MessageData } from "@/supabase/functions/_types/Database.type";
import { supabase } from "@/utils/supabase/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { extractSupabaseError } from "@/utils/supabase/errorHandling";
import { useTranslation } from "react-i18next";

export const useStartGameMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (gameId: string) => {
      if (!gameId) throw new Error("No game joined");
      const response = await supabase.functions.invoke("start-game", {
        body: { gameId: gameId },
      });
      if (response.error) {
        const errorMessage = await extractSupabaseError(
          response,
          "Error starting game",
        );
        throw new Error(errorMessage);
      }
      return { gameId: gameId };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      queryClient.invalidateQueries({ queryKey: ["game"] });
    },
  });
};

export const useCreateGameMutation = () => {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { i18n } = useTranslation();

  return useMutation({
    mutationFn: async () => {
      // Get the detected language from i18next, fallback to 'en'
      const detectedLang = i18n.language.startsWith("fr") ? "fr" : "en";

      const response = await supabase.functions.invoke("create-game", {
        body: { lang: detectedLang },
      });
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
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      queryClient.invalidateQueries({ queryKey: ["game"] });
      if (gameId) {
        router.push(`/?game=${gameId}`);
      }
    },
  });
};

export const usePlayerVoteMutation = () => {
  const queryClient = useQueryClient();
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      queryClient.invalidateQueries({ queryKey: ["game"] });
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
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      queryClient.invalidateQueries({ queryKey: ["game"] });
    },
  });
};

export const useStartVoteMutation = () => {
  const queryClient = useQueryClient();
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      queryClient.invalidateQueries({ queryKey: ["game"] });
    },
  });
};

export const useJoinGameMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (gameId: string) => {
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
      return;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      queryClient.invalidateQueries({ queryKey: ["game"] });
    },
  });
};
