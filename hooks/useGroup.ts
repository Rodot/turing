"use client";

import { supabase } from "@/utils/supabase/client";
import { User } from "@supabase/supabase-js";
import { useEffect, useState } from "react";

var loadingGroup = false;

export type Group = {
  id: string;
  usersId: string[];
};

const fetchGroup = (id: string) =>
  supabase.from("groups").select("*").eq("id", id);

const createGroup = async (id: string) => {
  const createGroupResponse = await supabase.from("groups").insert([{ id }]);
  if (createGroupResponse.error) {
    console.error("Error creating group:", createGroupResponse.error);
  } else {
    console.log("Created group: " + id);
  }
};

const addUserToGroup = async (userId: string, groupId: string) => {
  const updateProfileResponse = await supabase
    .from("profiles")
    .update([{ group_id: groupId }])
    .eq("id", userId);
  if (updateProfileResponse.error) {
    console.error("Error adding user to group:", updateProfileResponse.error);
  }
};

const fetchGroupUsers = async (groupId: string) => {
  const groupProfilesResponse = await supabase
    .from("profiles")
    .select("*")
    .eq("group_id", groupId);
  if (groupProfilesResponse.error) {
    console.error("Error getting group profiles:", groupProfilesResponse.error);
  } else {
    return groupProfilesResponse.data.map((profile) => profile.id);
  }
};

export function useGroup(user: User | null): Group | null {
  const [usersId, setUsersId] = useState<string[]>([]);
  const [groupId, setGroupId] = useState<string | null>(null);

  const updateGroupUsers = async () => {
    if (groupId) {
      const usersIds = await fetchGroupUsers(groupId);
      console.log("Group users:", usersIds);
      setUsersId(usersIds ?? []);
    }
  };

  const createOrLoadGroup = async () => {
    try {
      if (!groupId?.length) {
        console.error("No group ID in URL");
        return;
      }
      if (!user?.id) {
        console.error("No user ID");
        return;
      }
      if (loadingGroup) {
        console.error("Already loading group");
        return;
      }
      loadingGroup = true;

      // get group
      const groupResponse = await fetchGroup(groupId);

      // create group
      if (!groupResponse?.data?.length) {
        createGroup(groupId);
      } else {
        console.log("Group already exists: " + groupId);
      }

      // add current user
      addUserToGroup(user.id, groupId);

      // get group users
      updateGroupUsers();
    } catch (error) {
      console.error("Error joining group:", error);
    } finally {
      loadingGroup = false;
    }
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(window?.location?.search);
    setGroupId(urlParams.get("group") ?? null);

    createOrLoadGroup();

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
          console.log("Change received!", payload.new);
          updateGroupUsers();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  if (!groupId || !usersId) return null;

  return {
    id: groupId,
    usersId: usersId,
  };
}
