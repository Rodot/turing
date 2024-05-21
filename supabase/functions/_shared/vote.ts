import { SupabaseClient } from "https://esm.sh/v135/@supabase/supabase-js@2.43.2/dist/module/index.js";
import { MessageData, PlayerData, RoomData } from "../_types/Database.type.ts";
import { updateRoom } from "../_queries/room.query.ts";

export const triggerVoteIfNeeded = async (
  supabase: SupabaseClient,
  room: RoomData,
  players: PlayerData[],
  messages: MessageData[]
) => {
  console.log("num messages:", messages.length);
  console.log("next vote:", room.next_vote);

  // not voting yet
  if (messages.length < room.next_vote) return false;

  console.log("Voting time!");

  // set next vote
  const numLivingPlayers = players.filter((player) => !player.is_dead).length;
  const nextVote = messages.length + 3 * (numLivingPlayers - 1);

  // start voting
  await updateRoom(supabase, room.id, {
    next_vote: nextVote,
    status: "voting",
  });

  return true;
};
