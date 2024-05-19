"use client";

import { fetchRoomProfiles } from "@/queries/db/profile.query";
import { ProfileData } from "@/types/Database.type";
import { supabase } from "@/utils/supabase/client";
import { useEffect, useState } from "react";

export function useRoomUsers(roomId: string | null) {
  const [roomProfiles, setRoomProfiles] = useState<ProfileData[]>([]);

  const updateRoomUsers = async () => {
    if (!roomId?.length) {
      setRoomProfiles([]);
      return;
    }
    const newRoomProfiles = await fetchRoomProfiles(roomId);
    setRoomProfiles(newRoomProfiles ?? []);
  };

  useEffect(() => {
    updateRoomUsers();

    if (!roomId?.length) return;

    // listen for changes to room users
    const channel = supabase
      .channel("room_profiles" + roomId)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "profiles",
          // filter: "room_id=eq." + roomId,
        },
        (payload) => {
          updateRoomUsers();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomId]);

  return roomProfiles;
}
