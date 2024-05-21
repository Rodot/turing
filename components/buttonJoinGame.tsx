import React, { useContext } from "react";
import { Button, SxProps, Theme } from "@mui/material";
import { useState } from "react";
import { Spinner } from "./spinner";
import { RoomContext } from "./contextProvider";

interface Props {
  roomId: string | null | undefined;
  sx?: SxProps<Theme>;
}

export const ButtonJoinGame: React.FC<Props> = ({ sx, roomId }) => {
  const [loading, setLoading] = useState(false);
  const room = useContext(RoomContext);

  const joinNextGame = async () => {
    if (!roomId) return;
    try {
      setLoading(true);
      room?.joinRoom(roomId);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      color="secondary"
      variant="contained"
      onClick={joinNextGame}
      disabled={loading || !roomId}
    >
      Join Next Game
      {loading && <Spinner />}
    </Button>
  );
};
