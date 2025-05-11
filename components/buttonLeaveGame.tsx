import React from "react";
import { Logout } from "@mui/icons-material";
import { Button } from "@mui/material";
import { useContext, useState } from "react";
import { PlayersContext, RoomContext } from "./contextProvider";
import { deletePlayer } from "@/queries/db/players.query";
import { supabase } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

interface Props {
  label?: string;
}

export const ButtonLeaveGame: React.FC<Props> = ({ label }) => {
  const room = useContext(RoomContext);
  const players = useContext(PlayersContext);
  const me = players?.find((p) => p.id === p?.id);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const leaveGame = async () => {
    try {
      setLoading(true);
      if (me?.id) await deletePlayer(supabase, me.id);
      await room?.leaveRoom();
      router.push("/");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      color="secondary"
      onClick={leaveGame}
      disabled={loading || !room?.data?.id}
    >
      <Logout sx={{ mr: label?.length ? 1 : 0 }} />
      {label}
    </Button>
  );
};
