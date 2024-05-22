export type MessageData = {
  id: number;
  user_id: string;
  player_id: string;
  room_id: string;
  author: string;
  content: string;
};

export type ProfileData = {
  id: string;
  room_id: string;
  name: string;
};

export type RoomData = {
  id: string;
  status: string;
  next_player_id: string | null;
  last_vote: number;
  next_vote: number;
  next_room_id: string | null;
};

export type PlayerData = {
  id: string;
  name: string;
  room_id: string;
  user_id: string | null;
  vote: string | null;
  is_dead: boolean;
  is_talking: boolean;
};
