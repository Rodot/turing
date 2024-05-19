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
