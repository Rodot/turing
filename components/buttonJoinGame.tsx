import React from "react";
import { Button } from "@mui/material";
import { useGameId } from "../hooks/useGameId";
import { useJoinGameMutation } from "@/hooks/useGameQuery";

export const ButtonJoinGame: React.FC = () => {
  const gameId = useGameId();
  const joinGameMutation = useJoinGameMutation();

  if (!gameId?.length) {
    return null;
  }

  return (
    <Button
      color="secondary"
      variant="contained"
      onClick={() => joinGameMutation.mutate(gameId)}
      disabled={joinGameMutation.isPending}
      aria-label="Join Game"
    >
      Join Game
    </Button>
  );
};
