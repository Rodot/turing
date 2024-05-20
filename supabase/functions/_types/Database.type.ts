export type MessageData = {
  id: number;
  user_id: string;
  author: string;
  content: string;
  room_id: string;
};

export type ProfileData = {
  id: string;
  room_id: string;
  created_at: string;
  updated_at: string;
  name: string;
};

export type RoomData = {
  id: string;
  status: string;
};

export type PlayerData = {
  id: string;
  name: string;
  room_id: string;
  user_id: string | null;
  vote: string | null;
  is_dead: boolean;
  created_at: string;
  updated_at: string;
};

export type PlayerDataInsert = Omit<
  PlayerData,
  "id" | "created_at" | "updated_at" | "vote" | "is_dead"
>;
