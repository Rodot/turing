import React from "react";
import { Button } from "@mui/material";
import { useRouter } from "next/navigation";
import { useProfileQuery } from "@/hooks/useProfileQuery";

export const ButtonResumeGame: React.FC = () => {
  const profileQuery = useProfileQuery();
  const router = useRouter();

  const startNewGame = async () => {
    router.push(`/game?game=${profileQuery.data?.game_id}`);
  };

  if (!profileQuery.data?.game_id) {
    return null;
  }

  return (
    <Button
      color="secondary"
      variant="contained"
      onClick={startNewGame}
      disabled={profileQuery.isLoading}
    >
      Return To Last Game
    </Button>
  );
};
