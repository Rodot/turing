import { SupabaseClient } from "https://esm.sh/v135/@supabase/supabase-js@2.43.2/dist/module/index.js";
import { MessageData, PlayerData, RoomData } from "../_types/Database.type.ts";
import { updateRoom } from "../_queries/room.query.ts";

export const nextVoteLength = (numLivingPlayers: number) => 10;

export const triggerVoteIfNeeded = async (
  supabase: SupabaseClient,
  room: RoomData,
  players: PlayerData[],
  messages: MessageData[]
) => {
  // not voting yet
  if (messages.length <= room.next_vote) return false;

  console.log("Voting time!");

  // delay 1 second
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // set next vote
  const numLivingPlayers = players.filter((player) => !player.is_dead).length;
  const nextVote = messages.length + nextVoteLength(numLivingPlayers);

  // start voting
  await updateRoom(supabase, room.id, {
    next_vote: nextVote,
    status: "voting",
    next_player_id: null,
  });

  return true;
};
