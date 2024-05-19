"use client";

import { insertRoom, fetchRoom } from "@/queries/room.query";
import { addUserToRoom, removeUserFromRoom } from "@/queries/profile.query";
import { User } from "@supabase/supabase-js";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { RoomData } from "@/types/Database.type";
import { supabase } from "@/utils/supabase/client";

export type Room = {
  data: RoomData | null;
  createRoom: () => void;
  leaveRoom: () => void;
};

var loadingRoom = false;

export function useRoom(user: User | null): Room | null {
  const [roomId, setRoomId] = useState<string | null>(null);
  const [roomData, setRoomData] = useState<RoomData | null>(null);
  const searchParams = useSearchParams();
  const router = useRouter();

  const createRoom = async () => {
    const newRoomId = uuidv4();
    router.push("/?room=" + newRoomId);
  };

  const leaveRoom = async () => {
    removeUserFromRoom(user?.id ?? "");
    setRoomId(null);
    setRoomData(null);
    router.push("/");
  };

  const updateRoomData = async (roomId: string) => {
    const roomData = await fetchRoom(roomId);
    console.log("Room data", roomData);
    setRoomData(roomData);
    return;
  };

  const createAndJoinRoom = async (newRoomId: string) => {
    try {
      if (!newRoomId?.length) return;
      if (!user?.id) return;
      if (loadingRoom) return;
      loadingRoom = true;

      const newRoomData = await fetchRoom(newRoomId);
      if (!newRoomData) {
        console.log("Creating room", newRoomId);
        await insertRoom(newRoomId);
      }

      console.log("Joining room", newRoomId);
      await addUserToRoom(user.id, newRoomId);

      setRoomId(newRoomId);
    } catch (error) {
      console.error("joinRoom: ", error);
    } finally {
      loadingRoom = false;
    }
  };

  // join room from URL
  useEffect(() => {
    const newRoomId = searchParams.get("room") ?? null;
    if (newRoomId?.length) {
      createAndJoinRoom(newRoomId).then(() => {});
    }
  }, [user, searchParams]);

  // listen for changes to room data
  useEffect(() => {
    if (!roomId) return;

    updateRoomData(roomId);

    const channel = supabase
      .channel("room" + roomId)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "rooms",
          filter: "id=eq." + roomId,
        },
        (payload) => {
          console.log("Room data updated", payload.new);
          setRoomData(payload.new as RoomData);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomId]);

  const data = roomData ?? null;
  return {
    data,
    createRoom,
    leaveRoom,
  };
}
