import React from "react";
import { Button } from "@mui/material";
import { useRoomId } from "../hooks/useRoomId";
import { useJoinRoomMutation } from "@/hooks/useRoomQuery";

export const ButtonJoinGame: React.FC = () => {
  const roomId = useRoomId();
  const joinRoomMutation = useJoinRoomMutation();

  if (!roomId?.length) {
    return null;
  }

  return (
    <Button
      color="secondary"
      variant="contained"
      onClick={() => joinRoomMutation.mutate(roomId)}
      disabled={joinRoomMutation.isPending}
    >
      Join Game
    </Button>
  );
};
