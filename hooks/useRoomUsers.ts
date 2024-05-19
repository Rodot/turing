"use client";

import { fetchRoomProfiles } from "@/queries/profile.query";
import { Profile } from "@/types/Database.type";
import { supabase } from "@/utils/supabase/client";
import { useEffect, useState } from "react";

export function useRoomUsers(roomId: string | null) {
  const [roomProfiles, setRoomProfiles] = useState<Profile[]>([]);

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
