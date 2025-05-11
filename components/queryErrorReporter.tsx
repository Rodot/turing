"use client";
import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useSnackbar } from "./snackbarContext";

export function QueryErrorReporter() {
  const queryClient = useQueryClient();
  const { showSnackbar } = useSnackbar();

  useEffect(() => {
    const queryCache = queryClient.getQueryCache();
    const mutationCache = queryClient.getMutationCache();

    // Handle query errors
    const unsubscribeQuery = queryCache.subscribe(() => {
      queryCache.getAll().forEach((query) => {
        if (query.state.error) {
          console.error("Query error:", query.queryKey, query.state.error);
          showSnackbar(`${query.state.error}`, "error");
        }
      });
    });

    // Handle mutation errors
    const unsubscribeMutation = mutationCache.subscribe(() => {
      mutationCache.getAll().forEach((mutation) => {
        if (mutation.state.error) {
          console.error(
            "Mutation error:",
            mutation.options.mutationKey,
            mutation.state.error,
          );
          showSnackbar(`${mutation.state.error}`, "error");
        }
      });
    });

    return () => {
      unsubscribeQuery();
      unsubscribeMutation();
    };
  }, [queryClient, showSnackbar]);

  return null;
}
