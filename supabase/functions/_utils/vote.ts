import { SupabaseClient } from "https://esm.sh/v135/@supabase/supabase-js@2.43.2/dist/module/index.js";
import { MessageData, RoomData } from "../_types/Database.type.ts";
import { updateRoom } from "../_queries/room.query.ts";
import { isNotSystem } from "../_shared/chat.ts";

export const nextVoteLength = (numPlayers: number) => 3 * numPlayers;

export const triggerVoteIfNeeded = async (
  supabase: SupabaseClient,
  room: RoomData,
  messages: MessageData[]
) => {
  // not voting yet
  if (messages.filter(isNotSystem).length < room.next_vote) return false;

  console.log("Voting time!");

  // start voting
  await updateRoom(supabase, room.id, {
    status: "voting",
    next_player_id: null,
  });

  return true;
};
