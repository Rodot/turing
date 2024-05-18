export type Message = {
  id: number;
  user_id: string;
  author: string;
  content: string;
  group_id: string;
};

export type Group = {
  id: string;
  usersId: string[];
};
