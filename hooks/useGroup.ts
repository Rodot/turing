"use client";

import { insertGroup, fetchGroup } from "@/queries/group.query";
import { addUserToGroup, removeUserFromGroup } from "@/queries/profile.query";
import { User } from "@supabase/supabase-js";
import { useRouter, useSearchParams } from "next/navigation";
import { use, useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";

export type Group = {
  id: string | null;
  createGroup: () => void;
  leaveGroup: () => void;
};

var loadingGroup = false;

export function useGroup(user: User | null): Group | null {
  const [groupId, setGroupId] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const router = useRouter();

  const createGroup = async () => {
    const newGroupId = uuidv4();
    setGroupId(newGroupId);
    router.push("/?group=" + newGroupId);
  };

  const leaveGroup = async () => {
    removeUserFromGroup(user?.id ?? "");
    setGroupId(null);
    router.push("/");
  };

  const createAndJoinGroup = async () => {
    try {
      if (!groupId?.length) return;
      if (!user?.id) return;
      if (loadingGroup) return;
      loadingGroup = true;

      const groupResponse = await fetchGroup(groupId);
      if (!groupResponse?.data?.length) {
        await insertGroup(groupId);
        console.log("Created group", groupId);
      }

      await addUserToGroup(user.id, groupId);
      console.log("Joined group", groupId);
    } catch (error) {
      console.error("joinGroup: ", error);
    } finally {
      loadingGroup = false;
    }
  };

  useEffect(() => {
    const newGroupId = searchParams.get("group") ?? "";
    if (newGroupId?.length) {
      setGroupId(newGroupId);
      createAndJoinGroup();
    }
  }, [user, searchParams]);

  return {
    id: groupId,
    createGroup,
    leaveGroup,
  };
}
