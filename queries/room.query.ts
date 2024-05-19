import { supabase } from "@/utils/supabase/client";

export const fetchRoom = async (id: string) => {
  const req = await supabase.from("rooms").select("*").eq("id", id);
  if (req.error) {
    throw new Error(req.error.message);
  } else {
    const room = req?.data?.[0] ?? null;
    return room;
  }
};

export const insertRoom = async (id: string) => {
  const req = await supabase.from("rooms").insert([{ id }]);
  if (req.error) {
    throw new Error(req.error.message);
  }
};
