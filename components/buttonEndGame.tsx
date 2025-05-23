import React from "react";
import { Close } from "@mui/icons-material";
import { Button } from "@mui/material";
import { useEndGameMutation } from "@/hooks/useFunctionsMutation";
import { useProfileQuery } from "@/hooks/useProfileQuery";
import { useIsAnythingLoading } from "@/hooks/useIsAnythingLoading";

export const ButtonEndGame: React.FC = () => {
  const endGameMutation = useEndGameMutation();
  const profileQuery = useProfileQuery();
  const isAnything = useIsAnythingLoading();
  const gameId = profileQuery.data?.game_id ?? "";

  return (
    <Button
      color="secondary"
      onClick={() => endGameMutation.mutate(gameId)}
      disabled={isAnything}
    >
      <Close />
      End Game
    </Button>
  );
};
