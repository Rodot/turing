import { supabase } from "@/utils/supabase/client";

export const fetchRoom = (id: string) =>
  supabase.from("rooms").select("*").eq("id", id);

export const insertRoom = async (id: string) => {
  const req = await supabase.from("rooms").insert([{ id }]);
  if (req.error) {
    throw new Error(req.error.message);
  }
};
