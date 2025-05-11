import React from "react";
import { Logout } from "@mui/icons-material";
import { Button } from "@mui/material";
import { useLeaveRoomMutation } from "@/hooks/useRoomQuery";
import { useProfileQuery } from "@/hooks/useProfileQuery";

export const ButtonLeaveGame: React.FC = () => {
  const leaveRoomMutation = useLeaveRoomMutation();
  const profileQuery = useProfileQuery();

  if (!profileQuery.data?.room_id) {
    return null;
  }

  return (
    <Button
      color="secondary"
      onClick={() => leaveRoomMutation.mutate()}
      disabled={leaveRoomMutation.isPending || profileQuery.isLoading}
    >
      <Logout sx={{ mr: 1 }} />
      Leave Game
    </Button>
  );
};
