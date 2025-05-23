import React from "react";
import { Button } from "@mui/material";
import { useCreateGameMutation } from "@/hooks/useGameMutation";

export const ButtonCreateGame: React.FC = () => {
  const createGameMutation = useCreateGameMutation();

  return (
    <Button
      color="secondary"
      variant="contained"
      onClick={() => createGameMutation.mutate()}
      disabled={createGameMutation.isPending}
      aria-label="New Game"
    >
      New Game
    </Button>
  );
};
