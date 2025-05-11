import React from "react";
import { Button } from "@mui/material";
import { useContext, useState } from "react";
import { RoomContext } from "./contextProvider";
import { Spinner } from "./spinner";
import { useRouter } from "next/navigation";

export const ButtonCreateGame: React.FC = () => {
  const room = useContext(RoomContext);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const startNewGame = async () => {
    try {
      setLoading(true);
      await room?.createRoom();
      router.push("/game");
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
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
