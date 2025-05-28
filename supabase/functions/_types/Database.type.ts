export type MessageType =
  | "system"
  | "icebreaker"
  | "user"
  | "status"
  | "bot_picked";

export type MessageData = {
  id: string;
  profile_id: string;
  game_id: string;
  author_name: string;
  type: MessageType;
  content: string;
};

export type ProfileData = {
  id: string;
  game_id: string;
  name: string;
};

export type PlayerData = {
  id: string;
  name: string;
  vote: string | null;
  vote_blank: boolean;
  is_bot: boolean;
  score: number;
};

export type GameStatus =
  | "lobby"
  | "talking_warmup"
  | "talking_hunt"
  | "voting"
  | "over";

export type GameData = {
  id: string;
  created_at: string;
  lang: "en" | "fr";
  status: GameStatus;
  players: PlayerData[];
  last_bot_id: string | null;
};
