import React from "react";
import { Button } from "@mui/material";
import { useGameIdFromUrl } from "../hooks/useGameIdFromUrl";
import { useIsAnythingLoading } from "@/hooks/useIsAnythingLoading";
import { useJoinGameMutation } from "@/hooks/useFunctionsMutation";

export const ButtonJoinGame: React.FC = () => {
  const gameIdFromUrl = useGameIdFromUrl() ?? "";
  const joinGameMutation = useJoinGameMutation();
  const isAnythingLoading = useIsAnythingLoading();

  return (
    <Button
      color="secondary"
      variant="contained"
      onClick={() => joinGameMutation.mutate(gameIdFromUrl)}
      disabled={isAnythingLoading}
      aria-label="Join Game"
    >
      Join Game
    </Button>
  );
};
