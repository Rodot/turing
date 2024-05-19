"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabase/client";
import { ProfileData, RoomData } from "@/types/Database.type";
import {
  updateProfileRoom,
  removeProfileFromRoom,
} from "@/queries/db/profile.query";
import { fetchRoom } from "@/queries/db/room.query";
import {
  createRoomFunction,
  startGameFunction,
} from "@/queries/functions/functions.query";

export type Room = {
  data: RoomData | null;
  createRoom: () => void;
  leaveRoom: () => void;
  startGame: () => void;
};

export function useRoom(userProfile: ProfileData | null): Room | null {
  const [roomData, setRoomData] = useState<RoomData | null>(null);
  const searchParams = useSearchParams();
  const router = useRouter();

  // get room id from url and push to server
  useEffect(() => {
    if (!userProfile?.id) return;
    const newRoomId = searchParams.get("room") ?? null;
    router.push("/");
    if (newRoomId?.length) {
      updateProfileRoom(supabase, userProfile?.id, newRoomId);
    }
  }, [searchParams, router, userProfile?.id]);

  // listen for changes to room data
  useEffect(() => {
    if (!userProfile?.id) return;
    if (!userProfile?.room_id) {
      console.log("Left room");
      setRoomData(null);
      return;
    }
    console.log("Joined room", userProfile.room_id);

    fetchRoom(supabase, userProfile?.room_id).then((roomData) =>
      setRoomData(roomData)
    );

    const channel = supabase
      .channel("room" + userProfile.room_id)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "rooms",
          filter: "id=eq." + userProfile.room_id,
        },
        (payload) => {
          setRoomData(payload.new as RoomData);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userProfile?.id, userProfile?.room_id]);

  const createRoom = async () => {
    createRoomFunction(supabase);
  };

  const leaveRoom = async () => {
    console.log("Leaving room", userProfile?.id);
    if (!userProfile?.id) return;
    removeProfileFromRoom(supabase, userProfile?.id);
  };

  const startGame = async () => {
    const roomId = userProfile?.room_id;
    if (!roomId) return;
    console.log("Starting game", roomId);
    await startGameFunction(supabase, roomId);
  };

  const data = roomData ?? null;
  return {
    data,
    createRoom,
    leaveRoom,
    startGame,
  };
}
