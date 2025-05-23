"use client";

import React from "react";
import { LinearProgress } from "@mui/material";
import { useIsAnythingLoading } from "@/hooks/useIsAnythingLoading";

export const QueryLoadingBar: React.FC = () => {
  const isAnythingLoading = useIsAnythingLoading();

  if (!isAnythingLoading) return null;

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
