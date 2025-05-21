"use client";

import { ProfileData } from "@/supabase/functions/_types/Database.type";
import { supabase } from "@/utils/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useGameIdFromUrl } from "./useGameIdFromUrl";
import { fetchGameProfiles } from "@/queries/db/profile.query";
import { useEffect } from "react";

export const useProfilesQuery = () => {
  const queryClient = useQueryClient();
  const gameIdFromUrl = useGameIdFromUrl();

  const query = useQuery({
    queryKey: ["profiles", gameIdFromUrl],
    queryFn: async (): Promise<ProfileData[]> => {
      if (!gameIdFromUrl) return [];
      const profiles = await fetchGameProfiles(supabase, gameIdFromUrl);
      console.log("profilesQuery", profiles);
      return profiles;
    },
    enabled: !!gameIdFromUrl,
  });

  // Set up real-time subscription
  useEffect(() => {
    if (!gameIdFromUrl) return;

    const channel = supabase
      .channel(`profiles-${gameIdFromUrl}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "profiles",
          filter: `game_id=eq.${gameIdFromUrl}`,
        },
        () => {
          // Invalidate query when changes detected
          queryClient.invalidateQueries({
            queryKey: ["profiles", gameIdFromUrl],
          });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [gameIdFromUrl, queryClient]);

  return query;
};
