import { MessageData, PlayerData } from "../_types/Database.type.ts";

export const getPlayersWithLeastMessages = (
  players: PlayerData[],
  messages: MessageData[]
) => {
  const messagesCountPerPlayer = players.map((player) => ({
    player,
    count: messages.filter((message) => message.player_id === player.id).length,
  }));

  const minMessages = Math.min(...messagesCountPerPlayer.map((p) => p.count));

  const playersWithLeastMesssages = messagesCountPerPlayer
    .filter((p) => p.count === minMessages)
    .map((p) => p.player);

  return playersWithLeastMesssages;
};
