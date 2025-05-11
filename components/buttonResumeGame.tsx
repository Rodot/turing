import React from "react";
import { Button } from "@mui/material";
import { Spinner } from "./spinner";
import { useRouter } from "next/navigation";
import { useProfileQuery } from "@/hooks/useProfileQuery";

export const ButtonResumeGame: React.FC = () => {
  const profileQuery = useProfileQuery();
  const router = useRouter();

  const startNewGame = async () => {
    router.push(`/game?room=${profileQuery.data?.room_id}`);
  };

  if (!profileQuery.data?.room_id) {
    return null;
  }

  return (
    <Button
      color="secondary"
      variant="contained"
      onClick={startNewGame}
      disabled={profileQuery.isLoading}
    >
      Resume Game
      {profileQuery.isLoading && <Spinner />}
    </Button>
  );
};
