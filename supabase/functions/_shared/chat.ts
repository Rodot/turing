import { MessageData, PlayerData } from "../_types/Database.type.ts";

export const getPlayersWithLeastMessages = (
  players: PlayerData[],
  messages: MessageData[]
) => {
  const alivePlayers = players.filter((player) => !player.is_dead);
  const filteredMessages = messages.filter((message) =>
    alivePlayers.some((player) => player.id === message.player_id)
  );

  const acc = filteredMessages.reduce(
    (acc: Record<string, number>, message) => {
      if (!message.player_id) return acc;
      if (!acc[message.player_id]) {
        acc[message.player_id] = 0;
      }
      acc[message.player_id]++;
      return acc;
    },
    {}
  );

  const list = Object.entries(acc);
  const minMessages = Math.min(...list.map(([, count]) => count));
  //   const maxMessages = Math.max(...list.map(([, count]) => count));
  const playersIdsWithLeastMessages = list
    .filter(([, count]) => count === minMessages)
    .map(([id]) => id);
  const playersWithLeastMesssages = players.filter((player) =>
    playersIdsWithLeastMessages.includes(player.id)
  );
  return playersWithLeastMesssages;
};
