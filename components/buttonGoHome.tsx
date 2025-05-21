import React from "react";
import { IconButton } from "@mui/material";
import { useRouter } from "next/navigation";
import { ArrowBack } from "@mui/icons-material";
import { useQueryClient } from "@tanstack/react-query";
import { useUserQuery } from "@/hooks/useUserQuery";

export const ButtonGoHome: React.FC = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const userQuery = useUserQuery();
  const userId = userQuery.data?.id;

  const handleGoHome = () => {
    // Invalidate profile query if there's a userId
    if (userId) {
      queryClient.invalidateQueries({ queryKey: ["profile", userId] });
    }
    router.push("/");
  };

  return (
    <IconButton
      edge="start"
      onClick={handleGoHome}
      sx={{ color: "secondary.main" }}
    >
      <ArrowBack />
    </IconButton>
  );
};
