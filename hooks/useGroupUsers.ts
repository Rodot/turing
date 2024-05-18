"use client";

import { fetchGroupProfiles } from "@/queries/profile.query";
import { Profile } from "@/types/Database.type";
import { supabase } from "@/utils/supabase/client";
import { useEffect, useState } from "react";

export function useGroupUsers(groupId: string | null) {
  const [groupProfiles, setGroupProfiles] = useState<Profile[]>([]);

  const updateGroupUsers = async () => {
    if (!groupId?.length) {
      setGroupProfiles([]);
      return;
    }
    const newGroupProfiles = await fetchGroupProfiles(groupId);
    setGroupProfiles(newGroupProfiles ?? []);
  };

  useEffect(() => {
    updateGroupUsers();

    if (!groupId?.length) return;

    // listen for changes to group users
    const channel = supabase
      .channel("group_profiles")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "profiles",
          filter: "group_id=eq." + groupId,
        },
        (payload) => {
          updateGroupUsers();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [groupId]);

  return groupProfiles;
}
