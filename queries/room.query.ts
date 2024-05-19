import { supabase } from "@/utils/supabase/client";

export const fetchRoom = async (id: string) => {
  const req = await supabase.from("rooms").select("*").eq("id", id);
  console.log("fetchRoom", req);
  if (req.error) {
    throw new Error(req.error.message);
  } else {
    const room = req?.data?.[0] ?? null;
    console.log("Room", room);
    return room;
  }
};

export const insertRoom = async (id: string) => {
  const req = await supabase.from("rooms").insert([{ id }]);
  if (req.error) {
    throw new Error(req.error.message);
  }
};
