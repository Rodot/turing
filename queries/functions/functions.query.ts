import { MessageData } from "@/supabase/functions/_types/Database.type";
import { SupabaseClient } from "@supabase/supabase-js";

export const generateMessageFunction = async (
  supabase: SupabaseClient,
  roomId: string
) => {
  if (!roomId) return;
  supabase.functions.invoke("generate-message", {
    body: { roomId },
  });
};

export const startGameFunction = async (
  supabase: SupabaseClient,
  roomId: string
) => {
  if (!roomId) return;
  supabase.functions.invoke("start-game", {
    body: { roomId },
  });
};

export const createRoomFunction = async (supabase: SupabaseClient) => {
  supabase.functions.invoke("create-room");
};

export const playerVoteFunction = async (
  supabase: SupabaseClient,
  params: {
    roomId: string;
    playerId: string;
    vote: string;
  }
) => {
  supabase.functions.invoke("player-vote", { body: params });
};

export const postMessageFunction = async (
  supabase: SupabaseClient,
  message: Partial<MessageData>
) => {
  supabase.functions.invoke("post-message", { body: message });
};
