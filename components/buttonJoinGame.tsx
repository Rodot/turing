import React from "react";
import { Button, Chip, Box } from "@mui/material";
import { useRouter } from "next/navigation";
import { useGameIdFromUrl } from "../hooks/useGameIdFromUrl";
import { useIsAnythingLoading } from "@/hooks/useIsAnythingLoading";
import { useJoinGameMutation } from "@/hooks/useFunctionsMutation";
import { useSnackbar } from "./snackbarContext";
import { useGameQuery } from "@/hooks/useGameQuery";

export const ButtonJoinGame: React.FC = () => {
  const gameIdFromUrl = useGameIdFromUrl() ?? "";
  const joinGameMutation = useJoinGameMutation();
  const isAnythingLoading = useIsAnythingLoading();
  const { show } = useSnackbar();
  const router = useRouter();
  const { data: game } = useGameQuery();

  const handleJoinGame = async () => {
    if (!game) {
      show("Game not found", "error");
      router.push("/");
      return;
    }

    if (game.status !== "lobby") {
      show("This game already started", "error");
      router.push("/");
      return;
    }

    joinGameMutation.mutate(gameIdFromUrl);
  };

  return (
    <>
      {game?.players && game.players.length > 0 && (
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: 1,
            justifyContent: "center",
          }}
        >
          {game.players.map((player, index) => (
            <Chip key={index} label={player.name} size="small" />
          ))}
        </Box>
      )}

      <Box sx={{ my: 1 }} />

      <Button
        color="secondary"
        variant="contained"
        onClick={handleJoinGame}
        disabled={isAnythingLoading}
        aria-label="Join Game"
      >
        {game?.players?.[0]?.name
          ? `Join ${game.players[0].name}'s game`
          : "Join Game"}
      </Button>
    </>
  );
};
