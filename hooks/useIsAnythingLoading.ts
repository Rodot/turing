"use client";

import { useIsFetching, useIsMutating } from "@tanstack/react-query";
import { useProfileQuery } from "./useProfileQuery";

/**
 * Hook to determine if application is in a loading state.
 *
 * Loading is true when:
 * - Any queries are fetching
 * - Any mutations are running
 * - Profile data has not been loaded yet
 */
export const useIsAnythingLoading = () => {
  const isFetching = useIsFetching();
  const isMutating = useIsMutating();
  const profileQuery = useProfileQuery();

  const isLoading =
    isFetching > 0 || isMutating > 0 || profileQuery.data?.id === undefined;

  return isLoading;
};
