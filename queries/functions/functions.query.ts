import { MessageData } from "@/supabase/functions/_types/Database.type";
import { SupabaseClient } from "@supabase/supabase-js";

export const startGameFunction = async (
  supabase: SupabaseClient,
  gameId: string,
) => {
  if (!gameId) return;
  await supabase.functions.invoke("start-game", {
    body: { gameId },
  });
};

export const createGameFunction = async (supabase: SupabaseClient) => {
  const response = await supabase.functions.invoke("create-game");
  return response?.data?.game_id as string | undefined;
};

export const playerVoteFunction = async (
  supabase: SupabaseClient,
  params: {
    gameId: string;
    playerId: string;
    vote: string;
  },
) => {
  await supabase.functions.invoke("player-vote", { body: params });
};

export const postMessageFunction = async (
  supabase: SupabaseClient,
  message: Partial<MessageData>,
) => {
  await supabase.functions.invoke("post-message", { body: message });
};

export const generateAnswersFunction = async (
  supabase: SupabaseClient,
  gameId: string,
  playerName: string,
  lang: "en" | "fr",
) => {
  if (!gameId) return;
  const req = await supabase.functions.invoke("generate-answers", {
    body: { gameId, playerName, lang },
  });
  return req?.data;
};
