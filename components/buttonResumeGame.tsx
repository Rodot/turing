import React from "react";
import { Button, SxProps, Theme } from "@mui/material";
import { useContext, useState } from "react";
import { UserProfileContext } from "./contextProvider";
import { Spinner } from "./spinner";
import { useRouter } from "next/navigation";

interface Props {
  sx?: SxProps<Theme>;
}

export const ButtonResumeGame: React.FC<Props> = ({ sx }) => {
  const profile = useContext(UserProfileContext);
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

  if (!profile?.room_id) {
    return null;
  }

  return (
    <Button
      color="secondary"
      variant="contained"
      onClick={startNewGame}
      disabled={loading}
      sx={sx}
    >
      Resume Game
      {loading && <Spinner />}
    </Button>
  );
};
