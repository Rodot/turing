"use client";

import { ProfileData } from "@/supabase/functions/_types/Database.type";
import { supabase } from "@/utils/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useGameId } from "./useGameId";
import { fetchGameProfiles } from "@/queries/db/profile.query";
import { useEffect } from "react";

export const useProfilesQuery = () => {
  const queryClient = useQueryClient();
  const gameId = useGameId();

  const query = useQuery({
    queryKey: ["profiles", gameId],
    queryFn: async (): Promise<ProfileData[]> => {
      if (!gameId) return [];
      const profiles = await fetchGameProfiles(supabase, gameId);
      return profiles;
    },
    enabled: !!gameId,
  });

  // Set up real-time subscription
  useEffect(() => {
    if (!gameId) return;

    const channel = supabase
      .channel(`profiles-${gameId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "profiles",
          filter: `game_id=eq.${gameId}`,
        },
        () => {
          // Invalidate query when changes detected
          queryClient.invalidateQueries({ queryKey: ["profiles", gameId] });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [gameId, queryClient]);

  return query;
};
