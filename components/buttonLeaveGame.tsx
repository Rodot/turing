import React from "react";
import { Logout } from "@mui/icons-material";
import { Button, SxProps, Theme } from "@mui/material";
import { useContext, useState } from "react";
import { PlayersContext, RoomContext } from "./contextProvider";
import { deletePlayer } from "@/queries/db/players.query";
import { supabase } from "@/utils/supabase/client";

interface Props {
  label?: string;
  sx?: SxProps<Theme>;
}

export const ButtonLeaveGame: React.FC<Props> = ({ sx, label }) => {
  const room = useContext(RoomContext);
  const players = useContext(PlayersContext);
  const me = players?.find((p) => p.id === p?.id);
  const [loading, setLoading] = useState(false);

  const leaveGame = async () => {
    try {
      setLoading(true);
      if (me?.id) await deletePlayer(supabase, me.id);
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
      <Logout sx={{ mr: label?.length ? 1 : 0 }} />
      {label}
    </Button>
  );
};
