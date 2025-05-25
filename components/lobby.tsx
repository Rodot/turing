"use client";

import React from "react";
import {
  Box,
  Button,
  ButtonGroup,
  Chip,
  Container,
  Paper,
  Typography,
} from "@mui/material";
import { ButtonShare } from "./buttonShare";
import { ButtonGoHome } from "./buttonGoHome";
import { QRShare } from "./qrShare";
import { useUserQuery } from "@/hooks/useUserQuery";
import { useGameQuery } from "@/hooks/useGameQuery";
import { useGameLanguageMutation } from "@/hooks/useGameMutation";
import { useIsAnythingLoading } from "@/hooks/useIsAnythingLoading";
import { useStartGameMutation } from "@/hooks/useFunctionsMutation";
import { PlayerData } from "@/supabase/functions/_types/Database.type";

export const Lobby: React.FC = () => {
  const userQuery = useUserQuery();
  const gameQuery = useGameQuery();
  const gamePlayers = gameQuery.data?.players || [];
  const isHost = gamePlayers?.[0]?.id === userQuery.data?.id;
  const enoughPlayers = gamePlayers?.length >= 3;
  const url = window.location.href;
  const startGameMutation = useStartGameMutation();
  const gameLanguageMutation = useGameLanguageMutation();
  const isAnythingLoading = useIsAnythingLoading();

  return (
    <Container
      sx={{
        maxWidth: "720px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        p: 0,
      }}
    >
      <Paper
        sx={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          position: "sticky",
          top: 0,
          zIndex: 2,
          p: 0,
          pl: 2,
          borderRadius: 0,
          width: "100%",
          gap: 1,
        }}
      >
        <ButtonGoHome />
        {gamePlayers?.map((player: PlayerData) => (
          <Chip key={player.id} label={player.name} size="small" />
        ))}
      </Paper>

      <Box sx={{ mb: 4 }}></Box>

      {!enoughPlayers && (
        <Typography>
          <strong>3+ players required</strong>, invite people!
        </Typography>
      )}
      {enoughPlayers && !isHost && (
        <Typography>
          <strong>Waiting for {gamePlayers?.[0]?.name}</strong> to start the
          game.
        </Typography>
      )}
      {enoughPlayers && isHost && (
        <Button
          component="button"
          color="secondary"
          variant="contained"
          onClick={() => startGameMutation.mutate()}
          disabled={isAnythingLoading || !enoughPlayers}
          aria-label="Start Game"
        >
          Start Game
        </Button>
      )}

      {isHost && (
        <>
          <Box sx={{ mb: 4 }}></Box>

          <Typography sx={{ fontWeight: "bold", textAlign: "center" }}>
            Conversation Language
          </Typography>
          <ButtonGroup>
            <Button
              component="button"
              variant={gameQuery?.data?.lang === "en" ? "contained" : "text"}
              onClick={() => gameLanguageMutation.mutate("en")}
              disabled={gameLanguageMutation.isPending}
            >
              English
            </Button>
            <Button
              component="button"
              variant={gameQuery?.data?.lang === "fr" ? "contained" : "text"}
              onClick={() => gameLanguageMutation.mutate("fr")}
              disabled={gameLanguageMutation.isPending}
            >
              French
            </Button>
          </ButtonGroup>
        </>
      )}

      <Box sx={{ mb: 4 }}></Box>

      <Typography sx={{ fontWeight: "bold", textAlign: "center" }}>
        Invite Link
      </Typography>
      <Box>
        <ButtonShare url={url} />
      </Box>

      <Box sx={{ mb: 2 }}></Box>

      <Typography sx={{ fontWeight: "bold", textAlign: "center" }}>
        Scan to join
      </Typography>
      <QRShare url={url} />
    </Container>
  );
};
