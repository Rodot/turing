"use client";

import { fetchRoomContextProfiles } from "@/queries/profile.query";
import { Profile } from "@/types/Database.type";
import { supabase } from "@/utils/supabase/client";
import { useEffect, useState } from "react";

export function useRoomContextUsers(roomId: string | null) {
  const [roomProfiles, setRoomProfiles] = useState<Profile[]>([]);

  const updateRoomContextUsers = async () => {
    if (!roomId?.length) {
      setRoomProfiles([]);
      return;
    }
    const newRoomContextProfiles = await fetchRoomContextProfiles(roomId);
    setRoomProfiles(newRoomContextProfiles ?? []);
  };

  useEffect(() => {
    updateRoomContextUsers();

    if (!roomId?.length) return;

    // listen for changes to room users
    const channel = supabase
      .channel("room_profiles")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "profiles",
          // filter: "room_id=eq." + roomId,
        },
        (payload) => {
          updateRoomContextUsers();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomId]);

  return roomProfiles;
}
