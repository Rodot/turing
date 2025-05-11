import React, { useContext } from "react";
import { Button } from "@mui/material";
import { useState } from "react";
import { Spinner } from "./spinner";
import { useRouter } from "next/navigation";
import { RoomContext } from "./contextProvider";
import { useRoomId } from "../hooks/useRoomId";

export const ButtonJoinGame: React.FC = () => {
  const room = useContext(RoomContext);
  const [loading, setLoading] = useState(false);
  const roomId = useRoomId();
  const router = useRouter();

  const joinGame = async () => {
    try {
      setLoading(true);
      await room?.joinRoom(roomId);
      router.push(`/game?room=${roomId}`);
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
    >
      Join Game
      {loading && <Spinner />}
    </Button>
  );
};
