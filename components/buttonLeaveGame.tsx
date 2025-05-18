import React from "react";
import { Logout } from "@mui/icons-material";
import { Button } from "@mui/material";
import { useLeaveGameMutation } from "@/hooks/useGameQuery";
import { useProfileQuery } from "@/hooks/useProfileQuery";

export const ButtonLeaveGame: React.FC = () => {
  const leaveGameMutation = useLeaveGameMutation();
  const profileQuery = useProfileQuery();

  if (!profileQuery.data?.game_id) {
    return null;
  }

  return (
    <Button
      color="secondary"
      onClick={() => leaveGameMutation.mutate()}
      disabled={leaveGameMutation.isPending || profileQuery.isLoading}
    >
      <Logout sx={{ mr: 1 }} />
      Leave Game
    </Button>
  );
};
