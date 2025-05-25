import React from "react";
import { HowToVote } from "@mui/icons-material";
import { Button } from "@mui/material";
import { useStartVoteMutation } from "@/hooks/useFunctionsMutation";
import { useProfileQuery } from "@/hooks/useProfileQuery";
import { useTranslation } from "react-i18next";

export const ButtonStartVote: React.FC = () => {
  const { t } = useTranslation();
  const startVoteMutation = useStartVoteMutation();
  const profileQuery = useProfileQuery();
  const gameId = profileQuery.data?.game_id ?? "";

  return (
    <Button
      color="secondary"
      variant="contained"
      size="small"
      onClick={() => startVoteMutation.mutate(gameId)}
      disabled={startVoteMutation.isPending}
      aria-label="Start Vote"
    >
      <HowToVote sx={{ mr: 0.5 }} />
      {t("buttons.startVote")}
    </Button>
  );
};
