"use client";

import { supabase } from "@/utils/supabase/client";
import {
  removeProfileFromRoom,
  updateProfileRoom,
} from "@/queries/db/profile.query";
import {
  createRoomFunction,
  startGameFunction,
} from "@/queries/functions/functions.query";
import {
  ProfileData,
  RoomData,
} from "@/supabase/functions/_types/Database.type";
import { useTable } from "./useTable";

export type Room = {
  data: RoomData | null;
  createRoom: () => void;
  joinRoom: (roomId: string) => void;
  leaveRoom: () => void;
  startGame: () => void;
};

export function useRoom(profile: ProfileData | null): Room | null {
  const roomData = useTable<RoomData>(supabase, {
    tableName: "rooms",
    filterColumn: "id",
    filterValue: profile?.room_id || "",
  });

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

  const data = roomData?.[0] ?? null;
  return {
    data,
    createRoom,
    joinRoom,
    leaveRoom,
    startGame,
  };
}
