import React from "react";
import { Button } from "@mui/material";
import { Spinner } from "./spinner";
import { useCreateRoomMutation } from "@/hooks/useRoomQuery";

export const ButtonCreateGame: React.FC = () => {
  const createRoomMutation = useCreateRoomMutation();

  return (
    <Button
      color="secondary"
      variant="contained"
      onClick={() => createRoomMutation.mutate()}
      disabled={createRoomMutation.isPending}
    >
      Create New Game
      {createRoomMutation.isPending && <Spinner />}
    </Button>
  );
};
