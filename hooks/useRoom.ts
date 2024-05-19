"use client";

import { insertRoomContext, fetchRoomContext } from "@/queries/room.query";
import {
  addUserToRoomContext,
  removeUserFromRoomContext,
} from "@/queries/profile.query";
import { User } from "@supabase/supabase-js";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";

export type RoomContext = {
  id: string | null;
  createRoomContext: () => void;
  leaveRoomContext: () => void;
};

var loadingRoomContext = false;

export function useRoomContext(user: User | null): RoomContext | null {
  const [roomId, setRoomId] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const router = useRouter();

  const createRoomContext = async () => {
    const newRoomContextId = uuidv4();
    setRoomId(newRoomContextId);
    router.push("/?room=" + newRoomContextId);
  };

  const leaveRoomContext = async () => {
    removeUserFromRoomContext(user?.id ?? "");
    setRoomId(null);
    router.push("/");
  };

  const createAndJoinRoomContext = async (newRoomContextId: string) => {
    try {
      if (!newRoomContextId?.length) return;
      if (!user?.id) return;
      if (loadingRoomContext) return;
      loadingRoomContext = true;

      const roomResponse = await fetchRoomContext(newRoomContextId);
      if (!roomResponse?.data?.length) {
        await insertRoomContext(newRoomContextId);
        console.log("Created room", newRoomContextId);
      }

      await addUserToRoomContext(user.id, newRoomContextId);

      setRoomId(newRoomContextId);
      console.log("Joined room", newRoomContextId);
    } catch (error) {
      console.error("joinRoomContext: ", error);
    } finally {
      loadingRoomContext = false;
    }
  };

  useEffect(() => {
    const newRoomContextId = searchParams.get("room") ?? null;
    console.log("roomId from URL:", newRoomContextId);
    if (newRoomContextId?.length) {
      createAndJoinRoomContext(newRoomContextId);
    }
  }, [user, searchParams]);

  return {
    id: roomId,
    createRoomContext,
    leaveRoomContext,
  };
}
