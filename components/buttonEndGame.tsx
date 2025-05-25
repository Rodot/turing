import React from "react";
import { Close } from "@mui/icons-material";
import { Button } from "@mui/material";
import { useEndGameMutation } from "@/hooks/useFunctionsMutation";
import { useProfileQuery } from "@/hooks/useProfileQuery";
import { useIsAnythingLoading } from "@/hooks/useIsAnythingLoading";
import { useTranslation } from "react-i18next";

export const ButtonEndGame: React.FC = () => {
  const { t } = useTranslation();
  const endGameMutation = useEndGameMutation();
  const profileQuery = useProfileQuery();
  const isAnything = useIsAnythingLoading();
  const gameId = profileQuery.data?.game_id ?? "";

  return (
    <Button
      color="secondary"
      onClick={() => endGameMutation.mutate(gameId)}
      disabled={isAnything}
    >
      <Close />
      {t("buttons.endGame")}
    </Button>
  );
};
