"use client";

import { ProfileData } from "@/supabase/functions/_types/Database.type";
import { supabase } from "@/utils/supabase/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useUserQuery } from "./useUserQuery";
import {
  fetchUserProfile,
  updateProfileName,
} from "@/queries/db/profile.query";

export const useProfileQuery = () => {
  const userQuery = useUserQuery();
  const userId = userQuery.data?.id;

  return useQuery({
    queryKey: ["profile", userId],
    queryFn: async (): Promise<ProfileData | undefined> => {
      if (!userId) return undefined;
      return fetchUserProfile(supabase, userId);
    },
    enabled: !!userId,
  });
};

export const useProfileNameMutation = () => {
  const queryClient = useQueryClient();
  const userQuery = useUserQuery();
  const userId = userQuery.data?.id;

  return useMutation({
    mutationFn: async (name: string) => {
      if (!userId) throw new Error("User not authenticated");
      await updateProfileName(supabase, userId, name);
      return { userId, name };
    },
    onSuccess: (data) => {
      // Invalidate profile query to trigger a refetch
      queryClient.invalidateQueries({ queryKey: ["profile", data.userId] });
    },
  });
};
