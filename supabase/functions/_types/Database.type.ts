export type MessageType = "system" | "icebreaker" | "user";

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

export type GameStatus = "lobby" | "talking" | "voting" | "over";

export type GameData = {
  id: string;
  lang: "en" | "fr";
  status: GameStatus;
  players: PlayerData[];
};
