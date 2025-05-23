import React from "react";
import { HowToVote } from "@mui/icons-material";
import { Button } from "@mui/material";
import { useStartVoteMutation } from "@/hooks/useFunctionsMutation";
import { useProfileQuery } from "@/hooks/useProfileQuery";
import { useIsAnythingLoading } from "@/hooks/useIsAnythingLoading";

export const ButtonStartVote: React.FC = () => {
  const startVoteMutation = useStartVoteMutation();
  const profileQuery = useProfileQuery();
  const isAnythingLoading = useIsAnythingLoading();
  const gameId = profileQuery.data?.game_id ?? "";

  return (
    <Button
      color="secondary"
      size="small"
      onClick={() => startVoteMutation.mutate(gameId)}
      disabled={isAnythingLoading}
    >
      <HowToVote sx={{ mr: 0.5 }} />
      Start Vote
    </Button>
  );
};
