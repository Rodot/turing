export type MessageData = {
  id: string;
  profile_id: string;
  game_id: string;
  author: string;
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

export type GameData = {
  id: string;
  lang: "en" | "fr";
  status: "lobby" | "talking" | "voting" | "over";
  players: PlayerData[];
};
