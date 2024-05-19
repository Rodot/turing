export type Message = {
  id: number;
  user_id: string;
  author: string;
  content: string;
  room_id: string;
};

export type Profile = {
  id: string;
  room_id: string;
  created_at: string;
  updated_at: string;
  name: string;
};
