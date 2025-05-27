"use client";

import { ProfileData } from "@/supabase/functions/_types/Database.type";
import { supabase } from "@/utils/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { useUserQuery } from "./useUserQuery";
import { fetchUserProfile } from "@/queries/db/profile.query";

export const useProfileQuery = () => {
  const userQuery = useUserQuery();
  const userId = userQuery.data?.id;

  return useQuery({
    queryKey: ["profile", userId],
    queryFn: async (): Promise<ProfileData | undefined> => {
      if (!userId) return undefined;

      const profile = await fetchUserProfile(supabase, userId);
      if (profile === undefined) {
        throw new Error("Profile not found");
      }
      return profile;
    },
    enabled: !!userId,
  });
};
