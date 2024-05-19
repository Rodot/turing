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
