import { SupabaseClient } from "https://esm.sh/v135/@supabase/supabase-js@2.43.2/dist/module/index.js";
import { fetchPlayers } from "../_queries/players.query.ts";
import { fetchMessages } from "../_queries/messages.query.ts";
import { MessageData, PlayerData } from "../_types/Database.type.ts";
import { fetchRoom, updateRoom } from "../_queries/room.query.ts";
import { generateMessage } from "./prompts.ts";
import { triggerVoteIfNeeded } from "./vote.ts";

export const isHuman = (player: PlayerData) => !!player?.user_id;

export const getPlayerWithOlderMessage = (
  players: PlayerData[],
  messages: MessageData[]
) => {
  const mostRecentMessageIndexPerPlayer: Record<string, number> = {};
  players.forEach((player) => {
    mostRecentMessageIndexPerPlayer[player.id] = -1;
  });

  for (let idx = messages.length - 1; idx >= 0; idx--) {
    const message = messages[idx];
    // if the player's index wasn't already set
    if (mostRecentMessageIndexPerPlayer[message.player_id] === -1) {
      // set it
      mostRecentMessageIndexPerPlayer[message.player_id] = idx;
    }
  }

  console.log(
    "mostRecentMessageIndexPerPlayer",
    mostRecentMessageIndexPerPlayer
  );

  const oldestIndex = Math.min(
    ...Object.values(mostRecentMessageIndexPerPlayer)
  );

  const oldestPlayersIds = Object.entries(mostRecentMessageIndexPerPlayer)
    .filter(([_, index]) => index === oldestIndex)
    .map(([player, _]) => player);

  const randomPlayerId =
    oldestPlayersIds[Math.floor(Math.random() * oldestPlayersIds.length)];
  const randomPlayer = players.find((player) => player.id === randomPlayerId);
  if (!randomPlayer) return players[0];

  return randomPlayer;
};

export const nextChatTurn = async (
  supabase: SupabaseClient,
  room_id: string
) => {
  let timeout = 10;
  while (timeout) {
    timeout--;
    const players = await fetchPlayers(supabase, room_id);
    const messages = await fetchMessages(supabase, room_id);
    const room = await fetchRoom(supabase, room_id);
    if (!players?.length) throw new Error("No players found");
    if (!messages) throw new Error("No messages found");
    if (!room) throw new Error("No room found");

    if (await triggerVoteIfNeeded(supabase, room, players, messages)) return;

    const livingPlayers = players.filter((player) => !player.is_dead);
    const nextPlayer = getPlayerWithOlderMessage(livingPlayers, messages);
    await updateRoom(supabase, room_id, {
      next_player_id: nextPlayer.id,
      status: "talking",
    });
    if (isHuman(nextPlayer)) {
      console.log("Next player is human", nextPlayer.name);
      return;
    } else {
      console.log("Next player is bot", nextPlayer.name);
      await generateMessage(supabase, room_id, nextPlayer, messages);
    }
  }
};
