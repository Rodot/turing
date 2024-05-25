"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabase/client";
import {
  updateProfileRoom,
  removeProfileFromRoom,
} from "@/queries/db/profile.query";
import { fetchRoom } from "@/queries/db/room.query";
import {
  createRoomFunction,
  startGameFunction,
} from "@/queries/functions/functions.query";
import {
  ProfileData,
  RoomData,
} from "@/supabase/functions/_types/Database.type";

export type Room = {
  data: RoomData | null;
  createRoom: () => void;
  joinRoom: (roomId: string) => void;
  leaveRoom: () => void;
  startGame: () => void;
};

export function useRoom(profile: ProfileData | null): Room | null {
  const [roomData, setRoomData] = useState<RoomData | null>(null);
  const searchParams = useSearchParams();
  const router = useRouter();

  // get room id from url and push to server
  useEffect(() => {
    if (!profile?.id) return;
    const newRoomId = searchParams.get("room") ?? null;
    if (newRoomId?.length) {
      if (newRoomId === profile?.room_id) {
        router.push("/");
      } else {
        updateProfileRoom(supabase, profile?.id, newRoomId);
      }
    }
  }, [searchParams, router, profile?.id, profile?.room_id]);

  // listen for changes to room data
  useEffect(() => {
    if (!profile?.id) return;
    if (!profile?.room_id) {
      console.log("Left room");
      setRoomData(null);
      return;
    }

    const updateRoom = () => {
      if (!profile?.room_id) return;
      fetchRoom(supabase, profile?.room_id).then((roomData) =>
        setRoomData(roomData)
      );
    };

    console.log("Joined room", profile.room_id);

    updateRoom();

    const channel = supabase
      .channel("room" + profile.room_id)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "rooms",
          filter: "id=eq." + profile.room_id,
        },
        updateRoom
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profile?.id, profile?.room_id]);

  const createRoom = async () => {
    await createRoomFunction(supabase);
  };

  const joinRoom = async (roomId: string) => {
    if (!profile?.id) return;
    console.log("Joining room", roomId);
    await updateProfileRoom(supabase, profile.id, roomId);
  };

  const leaveRoom = async () => {
    console.log("Leaving room", profile?.id);
    if (!profile?.id) return;
    await removeProfileFromRoom(supabase, profile?.id);
  };

  const startGame = async () => {
    const roomId = profile?.room_id;
    if (!roomId) return;
    console.log("Starting game", roomId);
    await startGameFunction(supabase, roomId);
  };

  const data = roomData ?? null;
  return {
    data,
    createRoom,
    joinRoom,
    leaveRoom,
    startGame,
  };
}
