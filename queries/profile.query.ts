import { Profile } from "@/types/Database.type";
import { supabase } from "@/utils/supabase/client";

export const addUserToGroup = async (userId: string, groupId: string) => {
  const req = await supabase
    .from("profiles")
    .update([{ group_id: groupId }])
    .eq("id", userId);
  if (req.error) {
    throw new Error(req.error.message);
  }
};

export const removeUserFromGroup = async (userId: string) => {
  const req = await supabase
    .from("profiles")
    .update([{ group_id: null }])
    .eq("id", userId);
  if (req.error) {
    throw new Error(req.error.message);
  }
};

export const fetchGroupProfiles = async (
  groupId: string
): Promise<Profile[]> => {
  const req = await supabase
    .from("profiles")
    .select("*")
    .eq("group_id", groupId);
  if (req.error) {
    throw new Error(req.error.message);
  } else {
    const groupUsers = req?.data;
    return groupUsers ?? [];
  }
};
