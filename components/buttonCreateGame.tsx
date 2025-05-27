import React from "react";
import { Button } from "@mui/material";
import { useCreateGameMutation } from "@/hooks/useFunctionsMutation";
import { useTranslation } from "react-i18next";

export const ButtonCreateGame: React.FC = () => {
  const { t } = useTranslation();
  const createGameMutation = useCreateGameMutation();

  return (
    <Button
      color="secondary"
      variant="contained"
      onClick={() => createGameMutation.mutate()}
      disabled={createGameMutation.isPending}
      aria-label="New Game"
    >
      🏁&nbsp;{t("buttons.newGame")}
    </Button>
  );
};
