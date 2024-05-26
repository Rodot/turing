import { MessageData } from "@/supabase/functions/_types/Database.type";
import { SupabaseClient } from "@supabase/supabase-js";

export const startGameFunction = async (
  supabase: SupabaseClient,
  roomId: string
) => {
  if (!roomId) return;
  await supabase.functions.invoke("start-game", {
    body: { roomId },
  });
};

export const createRoomFunction = async (supabase: SupabaseClient) => {
  await supabase.functions.invoke("create-room");
};

export const playerVoteFunction = async (
  supabase: SupabaseClient,
  params: {
    roomId: string;
    playerId: string;
    vote: string;
  }
) => {
  await supabase.functions.invoke("player-vote", { body: params });
};

export const postMessageFunction = async (
  supabase: SupabaseClient,
  message: Partial<MessageData>
) => {
  await supabase.functions.invoke("post-message", { body: message });
};

export const generateAnswersFunction = async (
  supabase: SupabaseClient,
  roomId: string,
  playerName: string,
  lang: "en" | "fr"
) => {
  if (!roomId) return;
  const req = await supabase.functions.invoke("generate-answers", {
    body: { roomId, playerName, lang },
  });
  return req?.data;
};
