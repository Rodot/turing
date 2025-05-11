import React from "react";
import { Button } from "@mui/material";
import { useState } from "react";
import { Spinner } from "./spinner";
import { useRouter } from "next/navigation";
import { useProfileQuery } from "@/hooks/useProfileQuery";

export const ButtonResumeGame: React.FC = () => {
  const profileQuery = useProfileQuery();
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const startNewGame = async () => {
    try {
      setLoading(true);
      router.push("/game");
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (!profileQuery.data?.room_id) {
    return null;
  }

  return (
    <Button
      color="secondary"
      variant="contained"
      onClick={startNewGame}
      disabled={loading}
    >
      Resume Game
      {loading && <Spinner />}
    </Button>
  );
};
