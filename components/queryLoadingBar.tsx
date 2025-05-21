"use client";

import React from "react";
import { LinearProgress } from "@mui/material";
import { useIsLoading } from "@/hooks/useIsLoading";

export const QueryLoadingBar: React.FC = () => {
  const isLoading = useIsLoading();

  if (!isLoading) return null;

  return (
    <LinearProgress
      color="secondary"
      sx={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 10,
      }}
    />
  );
};
