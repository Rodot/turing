import { MessageData, PlayerData } from "../_types/Database.type.ts";

export const nextVoteLength = (numPlayers: number) => 2;

export const isSystem = (message: MessageData) => {
  if (message.author === "system") return true;
  if (message.author === "intro") return true;
  return false;
};
export const isNotSystem = (message: MessageData) => {
  return !isSystem(message);
};

export const cleanAnswer = (str: string) => {
  str = str.trim();
  str = str.toLowerCase();
  if (str.startsWith("'") && str.endsWith("'")) {
    return str.slice(1, -1);
  }
  if (str.startsWith('"') && str.endsWith('"')) {
    return str.slice(1, -1);
  }
  if (str.startsWith("`") && str.endsWith("`")) {
    return str.slice(1, -1);
  }
  if (str.startsWith("...")) {
    return str.slice(3);
  }
  if (str.endsWith("...")) {
    return str.slice(0, -3);
  }
  if (str.endsWith(".")) {
    return str.slice(0, -1);
  }
  return str;
};

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
