import React from "react";
import { Button } from "@mui/material";
import { useGameIdFromUrl } from "../hooks/useGameIdFromUrl";
import { useIsLoading } from "@/hooks/useIsLoading";
import { useJoinGameMutation } from "@/hooks/useFunctionsMutation";

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
