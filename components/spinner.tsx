"use client";

import React from "react";
import { CircularProgress } from "@mui/material";

export const Spinner: React.FC = () => {
  return (
    <CircularProgress
      color="secondary"
      size={24}
      sx={{
        position: "absolute",
        top: "50%",
        left: "50%",
        marginTop: "-12px",
        marginLeft: "-12px",
      }}
    />
  );
};
