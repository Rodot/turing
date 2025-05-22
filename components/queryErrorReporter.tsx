"use client";
import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useSnackbar } from "./snackbarContext";

export function QueryErrorReporter() {
  const queryClient = useQueryClient();
  const { show: showSnackbar } = useSnackbar();

  useEffect(() => {
    const queryCache = queryClient.getQueryCache();
    const mutationCache = queryClient.getMutationCache();

    // Handle query errors - only on error events
    const unsubscribeQuery = queryCache.subscribe((event) => {
      if (event.type === "updated" && event.query.state.error) {
        console.error(
          "Query error:",
          event.query.queryKey,
          event.query.state.error,
        );
        showSnackbar(`${event.query.state.error}`, "error");
      }
    });

    // Handle mutation errors - only on error events
    const unsubscribeMutation = mutationCache.subscribe((event) => {
      if (event.type === "updated" && event.mutation.state.error) {
        console.error(
          "Mutation error:",
          event.mutation.options.mutationKey,
          event.mutation.state.error,
        );
        showSnackbar(`${event.mutation.state.error}`, "error");
      }
    });

    return () => {
      unsubscribeQuery();
      unsubscribeMutation();
    };
  }, [queryClient, showSnackbar]);

  return null;
}
