import {
  MessageData,
  ProfileData,
  GameData,
  PlayerData,
} from "../_types/Database.type.ts";

export const nextVoteLength = (numPlayers: number) => 3 * numPlayers;

export const isSystem = (message: MessageData) => {
  if (message.type === "system") return true;
  if (message.type === "icebreaker") return true;
  return false;
};

export const isNotSystem = (message: MessageData) => {
  return !isSystem(message);
};

export const isHuman = (profile: ProfileData) => !!profile?.id;

export const removeEmojis = (text: string | null) => {
  if (!text) return "";
  return text.replace(
    /([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g,
    "",
  );
};

export const popRandom = <T>(array: Array<T>): T => {
  if (array.length === 0) {
    throw new Error("Cannot pop from empty array");
  }
  const index = Math.floor(Math.random() * array.length);
  const result = array.splice(index, 1)[0];
  if (result === undefined) {
    throw new Error("Popped element is undefined");
  }
  return result;
};

export const pickRandom = <T>(array: Array<T>): T => {
  if (array.length === 0) {
    throw new Error("Cannot pick from empty array");
  }
  const index = Math.floor(Math.random() * array.length);
  const result = array[index];
  if (result === undefined) {
    throw new Error("Picked element is undefined");
  }
  return result;
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
  str = str.replace(/—/g, ",");
  return str;
};

export const getProfilesWithLeastMessages = (
  profiles: ProfileData[],
  messages: MessageData[],
) => {
  const messagesCountPerProfile = profiles.map((profile) => ({
    profile,
    count: messages.filter((message) => message.profile_id === profile.id)
      .length,
  }));

  const minMessages = Math.min(...messagesCountPerProfile.map((p) => p.count));

  const profilesWithLeastMesssages = messagesCountPerProfile
    .filter((p) => p.count <= minMessages + 2)
    .map((p) => p.profile);

  return profilesWithLeastMesssages;
};

export const getPlayerFromGame = (
  game: GameData,
  playerId: string,
): PlayerData | null => {
  return game.players.find((player) => player.id === playerId) ?? null;
};
