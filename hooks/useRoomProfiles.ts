"use client";

import { fetchRoomProfiles } from "@/queries/db/profile.query";
import { ProfileData } from "@/types/Database.type";
import { supabase } from "@/utils/supabase/client";
import { useEffect, useState } from "react";

export function useRoomProfiles(roomId: string | null) {
  const [roomProfiles, setRoomProfiles] = useState<ProfileData[]>([]);

  const updateRoomProfiles = async () => {
    if (!roomId?.length) {
      setRoomProfiles([]);
      return;
    }
    const newRoomProfiles = await fetchRoomProfiles(supabase, roomId);
    setRoomProfiles(newRoomProfiles ?? []);
  };

  useEffect(() => {
    updateRoomProfiles();

    if (!roomId?.length) return;

    // listen for changes to room profiles
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
          updateRoomProfiles();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomId]);

  return roomProfiles;
}
