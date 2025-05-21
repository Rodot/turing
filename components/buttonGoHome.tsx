import React from "react";
import { IconButton } from "@mui/material";
import { useRouter } from "next/navigation";
import { ArrowBack } from "@mui/icons-material";

export const ButtonGoHome: React.FC = () => {
  const router = useRouter();

  return (
    <IconButton
      edge="start"
      onClick={() => router.push("/")}
      sx={{ color: "secondary.main" }}
    >
      <ArrowBack />
    </IconButton>
  );
};
