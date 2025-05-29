import React from "react";
import { Button } from "@mui/material";
import { useEndGameMutation } from "@/hooks/useFunctionsMutation";
import { useProfileQuery } from "@/hooks/useProfileQuery";
import { useTranslation } from "react-i18next";
import { Spinner } from "./spinner";

export const ButtonEndGame: React.FC = () => {
  const { t } = useTranslation();
  const endGameMutation = useEndGameMutation();
  const profileQuery = useProfileQuery();
  const gameId = profileQuery.data?.game_id ?? "";

  return (
    <Button
      color="secondary"
      onClick={() => endGameMutation.mutate(gameId)}
      disabled={endGameMutation.isPending}
    >
      ❌&nbsp;{t("buttons.endGame")}
      {endGameMutation.isPending && <Spinner />}
    </Button>
  );
};
