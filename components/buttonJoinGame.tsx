import React from "react";
import { Button, Box } from "@mui/material";
import { useRouter } from "next/navigation";
import { useGameIdFromUrl } from "./gameIdProvider";
import { useJoinGameMutation } from "@/hooks/useFunctionsMutation";
import { useSnackbar } from "./snackbarContext";
import { useGameQuery } from "@/hooks/useGameQuery";
import { useTranslation } from "react-i18next";
import { PlayerList } from "./playerList";
import { Spinner } from "./spinner";

export const ButtonJoinGame: React.FC = () => {
  const { t } = useTranslation();
  const gameIdFromUrl = useGameIdFromUrl() ?? "";
  const joinGameMutation = useJoinGameMutation();
  const { show } = useSnackbar();
  const router = useRouter();
  const { data: game } = useGameQuery();

  const handleJoinGame = async () => {
    if (!game) {
      show(t("errors.gameNotFound"), "error");
      router.push("/");
      return;
    }

    if (game.status === "over") {
      show(t("errors.gameAlreadyStarted"), "error");
      router.push("/");
      return;
    }

    joinGameMutation.mutate(gameIdFromUrl);
  };

  const handleSpectate = () => {
    router.push(`/spectate?game=${gameIdFromUrl}`);
  };

  return (
    <>
      <PlayerList players={game?.players ?? []} />

      <Box sx={{ my: 1 }} />

      <Button
        color="secondary"
        variant="contained"
        onClick={handleJoinGame}
        disabled={joinGameMutation.isPending}
        aria-label="Join Game"
      >
        👋&nbsp;
        {game?.players?.[0]?.name
          ? t("buttons.joinPlayerGame", { player: game.players[0].name })
          : t("buttons.joinGame")}
        {joinGameMutation.isPending && <Spinner />}
      </Button>

      <Button
        color="secondary"
        variant="text"
        onClick={handleSpectate}
        aria-label="Spectate Game"
        sx={{ mt: 1 }}
      >
        👁️&nbsp;{t("buttons.spectate")}
      </Button>
    </>
  );
};
