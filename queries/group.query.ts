import { supabase } from "@/utils/supabase/client";

export const fetchGroup = (id: string) =>
  supabase.from("groups").select("*").eq("id", id);

export const insertGroup = async (id: string) => {
  const req = await supabase.from("groups").insert([{ id }]);
  if (req.error) {
    throw new Error(req.error.message);
  }
};
