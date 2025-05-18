export type MessageData = {
  id: string;
  user_id: string;
  player_id: string;
  game_id: string;
  author: string;
  content: string;
};

export type ProfileData = {
  id: string;
  game_id: string;
  name: string;
};

export type GameData = {
  id: string;
  lang: "en" | "fr";
  status: "lobby" | "talking" | "voting" | "over";
  last_vote: number;
  next_vote: number;
  next_game_id: string | null;
};

export type PlayerData = {
  id: string;
  name: string;
  game_id: string;
  user_id: string | null;
  vote: string | null;
  vote_blank: boolean;
  is_bot: boolean;
  score: number;
};
