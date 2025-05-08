import React, { useContext, useEffect } from "react";
import { Button, SxProps, Theme } from "@mui/material";
import { useState } from "react";
import { Spinner } from "./spinner";
import { useRouter, useSearchParams } from "next/navigation";
import { RoomContext } from "./contextProvider";

interface Props {
  sx?: SxProps<Theme>;
}

export const ButtonJoinGame: React.FC<Props> = ({ sx }) => {
  const room = useContext(RoomContext);
  const [loading, setLoading] = useState(false);
  const [roomId, setRoomId] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const newRoomId = searchParams.get("room") ?? null;
    if (newRoomId?.length) {
      setRoomId(newRoomId);
    }
  }, [searchParams, room]);

  const joinGame = async () => {
    try {
      setLoading(true);
      await room?.joinRoom(roomId);
      router.push("/game");
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (!roomId?.length) {
    return null;
  }

  return (
    <Button
      color="secondary"
      variant="contained"
      onClick={joinGame}
      disabled={loading}
      sx={sx}
    >
      Join Game
      {loading && <Spinner />}
    </Button>
  );
};
