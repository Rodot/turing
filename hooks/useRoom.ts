"use client";

import { insertRoom, fetchRoom } from "@/queries/room.query";
import { addUserToRoom, removeUserFromRoom } from "@/queries/profile.query";
import { User } from "@supabase/supabase-js";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";

export type Room = {
  id: string | null;
  createRoom: () => void;
  leaveRoom: () => void;
};

var loadingRoom = false;

export function useRoom(user: User | null): Room | null {
  const [roomId, setRoomId] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const router = useRouter();

  const createRoom = async () => {
    const newRoomId = uuidv4();
    setRoomId(newRoomId);
    router.push("/?room=" + newRoomId);
  };

  const leaveRoom = async () => {
    removeUserFromRoom(user?.id ?? "");
    setRoomId(null);
    router.push("/");
  };

  const createAndJoinRoom = async (newRoomId: string) => {
    try {
      if (!newRoomId?.length) return;
      if (!user?.id) return;
      if (loadingRoom) return;
      loadingRoom = true;

      const roomResponse = await fetchRoom(newRoomId);
      if (!roomResponse?.data?.length) {
        await insertRoom(newRoomId);
        console.log("Created room", newRoomId);
      }

      await addUserToRoom(user.id, newRoomId);

      setRoomId(newRoomId);
      console.log("Joined room", newRoomId);
    } catch (error) {
      console.error("joinRoom: ", error);
    } finally {
      loadingRoom = false;
    }
  };

  useEffect(() => {
    const newRoomId = searchParams.get("room") ?? null;
    console.log("roomId from URL:", newRoomId);
    if (newRoomId?.length) {
      createAndJoinRoom(newRoomId);
    }
  }, [user, searchParams]);

  return {
    id: roomId,
    createRoom: createRoom,
    leaveRoom: leaveRoom,
  };
}
