"use client";

import { insertGroup, fetchGroup } from "@/queries/group.query";
import { addUserToGroup, removeUserFromGroup } from "@/queries/profile.query";
import { User } from "@supabase/supabase-js";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
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
    // window.location.href = "/?group=" + newGroupId;
  };

  const leaveGroup = async () => {
    removeUserFromGroup(user?.id ?? "");
    setGroupId(null);
    router.push("/");
  };

  const createAndJoinGroup = async (newGroupId: string) => {
    try {
      if (!newGroupId?.length) return;
      if (!user?.id) return;
      if (loadingGroup) return;
      loadingGroup = true;

      const groupResponse = await fetchGroup(newGroupId);
      if (!groupResponse?.data?.length) {
        await insertGroup(newGroupId);
        console.log("Created group", newGroupId);
      }

      await addUserToGroup(user.id, newGroupId);

      setGroupId(newGroupId);
      console.log("Joined group", newGroupId);
    } catch (error) {
      console.error("joinGroup: ", error);
    } finally {
      loadingGroup = false;
    }
  };

  useEffect(() => {
    const newGroupId = searchParams.get("group") ?? null;
    console.log("groupId from URL:", newGroupId);
    if (newGroupId?.length) {
      createAndJoinGroup(newGroupId);
    }
  }, [user, searchParams]);

  return {
    id: groupId,
    createGroup,
    leaveGroup,
  };
}
