import { MessageData, PlayerData } from "../_types/Database.type.ts";

export const nextVoteLength = (numPlayers: number) => 3 * numPlayers;

export const isSystem = (message: MessageData) => {
  if (message.author === "system") return true;
  if (message.author === "intro") return true;
  return false;
};

export const isNotSystem = (message: MessageData) => {
  return !isSystem(message);
};

export const isHuman = (player: PlayerData) => !!player?.user_id;

export const removeEmojis = (text: string) => {
  return text.replace(
    /([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g,
    ""
  );
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
