import React from "react";
import { Button } from "@mui/material";
import { useRouter } from "next/navigation";
import { useProfileQuery } from "@/hooks/useProfileQuery";
import { useIsAnythingLoading } from "@/hooks/useIsAnythingLoading";

export const ButtonResumeGame: React.FC = () => {
  const profileQuery = useProfileQuery();
  const router = useRouter();
  const isAnythingLoading = useIsAnythingLoading();

  const startNewGame = async () => {
    router.push(`/?game=${profileQuery.data?.game_id}`);
  };

  return (
    <Button
      color="secondary"
      variant="contained"
      onClick={startNewGame}
      disabled={isAnythingLoading}
    >
      Resume
    </Button>
  );
};
