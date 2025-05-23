"use client";

import { supabase } from "@/utils/supabase/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useUserQuery } from "./useUserQuery";
import { updateProfileName } from "@/queries/db/profile.query";

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
