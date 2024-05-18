export type Message = {
  id: number;
  user_id: string;
  author: string;
  content: string;
  group_id: string;
};

export type Profile = {
  id: string;
  group_id: string;
  created_at: string;
  updated_at: string;
  name: string;
};
