import React from "react";
import { Button } from "@mui/material";
import { useGameIdFromUrl } from "../hooks/useGameIdFromUrl";
import { useJoinGameMutation } from "@/hooks/useGameQuery";
import { useIsLoading } from "@/hooks/useIsLoading";

export const ButtonJoinGame: React.FC = () => {
  const gameIdFromUrl = useGameIdFromUrl() ?? "";
  const joinGameMutation = useJoinGameMutation();
  const isLoading = useIsLoading();

  return (
    <Button
      color="secondary"
      variant="contained"
      onClick={() => joinGameMutation.mutate(gameIdFromUrl)}
      disabled={isLoading}
      aria-label="Join Game"
    >
      Join Game
    </Button>
  );
};
