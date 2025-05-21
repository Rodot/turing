import React from "react";
import { Close } from "@mui/icons-material";
import { Button } from "@mui/material";
import { useEndGameMutation } from "@/hooks/useFunctionsQuery";
import { useProfileQuery } from "@/hooks/useProfileQuery";
import { useIsLoading } from "@/hooks/useIsLoading";

export const ButtonEndGame: React.FC = () => {
  const endGameMutation = useEndGameMutation();
  const profileQuery = useProfileQuery();
  const isLoading = useIsLoading();
  const gameId = profileQuery.data?.game_id ?? "";

  return (
    <Button
      color="secondary"
      onClick={() => endGameMutation.mutate(gameId)}
      disabled={isLoading}
    >
      <Close />
      End Game
    </Button>
  );
};
