import React from "react";
import { Logout } from "@mui/icons-material";
import { Button, SxProps, Theme } from "@mui/material";
import { useContext, useState } from "react";
import { RoomContext } from "./contextProvider";

interface Props {
  sx?: SxProps<Theme>;
}

export const ButtonLeaveGame: React.FC<Props> = ({ sx }) => {
  const room = useContext(RoomContext);
  const [loading, setLoading] = useState(false);

  const leaveGame = async () => {
    try {
      setLoading(true);
      await room?.leaveRoom();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      sx={sx}
      color="secondary"
      onClick={leaveGame}
      disabled={loading || !room?.data?.id}
    >
      <Logout sx={{ mr: 1 }} />
      Leave Game
    </Button>
  );
};
