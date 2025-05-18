"use client";

import { MessageData } from "@/supabase/functions/_types/Database.type";
import { supabase } from "@/utils/supabase/client";
import { useMutation } from "@tanstack/react-query";
import { useGameId } from "./useGameId";
import { useProfileQuery } from "./useProfileQuery";
import { useRouter } from "next/navigation";

export const useStartGameMutation = () => {
  const gameId = useGameId();

  return useMutation({
    mutationFn: async () => {
      if (!gameId) throw new Error("No game joined");
      await supabase.functions.invoke("start-game", {
        body: { gameId },
      });
      return { gameId };
    },
  });
};

export const useCreateGameMutation = () => {
  const profileQuery = useProfileQuery();
  const profile = profileQuery.data;
  const router = useRouter();

  return useMutation({
    mutationFn: async () => {
      const response = await supabase.functions.invoke("create-game");
      return response?.data?.game_id as string | undefined;
    },
    onSuccess: (gameId) => {
      if (gameId && profile?.id) {
        router.push(`/?game=${gameId}`);
      }
    },
  });
};

export const usePlayerVoteMutation = () => {
  return useMutation({
    mutationFn: async (params: {
      gameId: string;
      playerId: string;
      vote: string;
    }) => {
      await supabase.functions.invoke("player-vote", { body: params });
      return params;
    },
  });
};

export const usePostMessageMutation = () => {
  return useMutation({
    mutationFn: async (message: Partial<MessageData>) => {
      await supabase.functions.invoke("post-message", { body: message });
      return message;
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
      const req = await supabase.functions.invoke("generate-answers", {
        body: { gameId, playerName, lang },
      });
      return req?.data;
    },
  });
};
