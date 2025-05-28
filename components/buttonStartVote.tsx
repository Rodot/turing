import React from "react";
import { Button } from "@mui/material";
import { useStartVoteMutation } from "@/hooks/useFunctionsMutation";
import { useProfileQuery } from "@/hooks/useProfileQuery";
import { useTranslation } from "react-i18next";
import { Spinner } from "./spinner";

export const ButtonStartVote: React.FC = () => {
  const { t } = useTranslation();
  const startVoteMutation = useStartVoteMutation();
  const profileQuery = useProfileQuery();
  const gameId = profileQuery.data?.game_id ?? "";

  return (
    <Button
      color="primary"
      variant="contained"
      size="small"
      onClick={() => startVoteMutation.mutate(gameId)}
      disabled={startVoteMutation.isPending}
      aria-label="Start Vote"
    >
      🗳️&nbsp;{t("buttons.startVote")}
      {startVoteMutation.isPending && <Spinner />}
    </Button>
  );
};
