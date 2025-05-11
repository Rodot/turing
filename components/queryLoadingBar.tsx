"use client";

import React from "react";
import { LinearProgress } from "@mui/material";
import { useIsFetching, useIsMutating } from "@tanstack/react-query";

export const QueryLoadingBar: React.FC = () => {
  const isFetching = useIsFetching();
  const isMutating = useIsMutating();

  const isLoading = isFetching > 0 || isMutating > 0;

  if (!isLoading) return null;

  return (
    <LinearProgress
      color="secondary"
      sx={{
        position: "fixed",
        top: "64px", // Below AppBar
        left: 0,
        right: 0,
        zIndex: 1100,
      }}
    />
  );
};
