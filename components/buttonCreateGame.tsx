import React from "react";
import { Button, SxProps, Theme } from "@mui/material";
import { useContext, useState } from "react";
import { RoomContext } from "./contextProvider";
import { Spinner } from "./spinner";

interface Props {
  sx?: SxProps<Theme>;
}

export const ButtonCreateGame: React.FC<Props> = ({ sx }) => {
  const room = useContext(RoomContext);
  const [loading, setLoading] = useState(false);

  const startNewGame = async () => {
    setLoading(true);
    room?.createRoom();
  };

  return (
    <Button
      color="secondary"
      variant="contained"
      onClick={startNewGame}
      disabled={loading}
    >
      New Game
      {loading && <Spinner />}
    </Button>
  );
};
