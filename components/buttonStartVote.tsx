import React from "react";
import { HowToVote } from "@mui/icons-material";
import { Button } from "@mui/material";
import { useStartVoteMutation } from "@/hooks/useFunctionsQuery";
import { useProfileQuery } from "@/hooks/useProfileQuery";
import { useIsLoading } from "@/hooks/useIsLoading";

export const ButtonStartVote: React.FC = () => {
  const startVoteMutation = useStartVoteMutation();
  const profileQuery = useProfileQuery();
  const isLoading = useIsLoading();
  const gameId = profileQuery.data?.game_id ?? "";

  return (
    <Button
      color="secondary"
      size="small"
      onClick={() => startVoteMutation.mutate(gameId)}
      disabled={isLoading}
    >
      <HowToVote sx={{ mr: 0.5 }} />
      Vote
    </Button>
  );
};
