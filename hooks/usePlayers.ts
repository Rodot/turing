"use client";

import { fetchPlayers } from "@/queries/db/players.query";
import { PlayerData } from "@/supabase/functions/_types/Database.type";
import { supabase } from "@/utils/supabase/client";
import { useEffect, useState } from "react";
import { Room } from "./useRoom";

export function usePlayers(room: Room | null) {
  const [players, setPlayers] = useState<PlayerData[]>([]);

  useEffect(() => {
    const updatePlayers = async () => {
      if (!room?.data?.id?.length) {
        setPlayers([]);
        return;
      }
      const newPlayers = await fetchPlayers(supabase, room?.data?.id);
      newPlayers.sort((a, b) => a.name.localeCompare(b.name));
      setPlayers(newPlayers ?? []);
    };

    updatePlayers();

    if (!room?.data?.id?.length) return;

    // listen for changes to room profiles
    const channel = supabase
      .channel("room_players" + room?.data?.id)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "players",
          filter: "room_id=eq." + room?.data?.id,
        },
        () => {
          updatePlayers();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [room?.data?.id, room?.data?.status]);

  return players;
}
