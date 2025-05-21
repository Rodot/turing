"use client";

import React from "react";
import {
  Box,
  Button,
  ButtonGroup,
  Chip,
  Container,
  Typography,
} from "@mui/material";
import { ButtonShare } from "./buttonShare";
import { ButtonGoHome } from "./buttonGoHome";
import { QRShare } from "./qrShare";
import { useUserQuery } from "@/hooks/useUserQuery";
import {
  useGameLanguageMutation,
  useGameQuery,
  useStartGameMutation,
} from "@/hooks/useGameQuery";
import { useProfilesQuery } from "@/hooks/useProfilesQuery";
import { useIsLoading } from "@/hooks/useIsLoading";

export const Lobby: React.FC = () => {
  const userQuery = useUserQuery();
  const gameQuery = useGameQuery();
  const profilesQuery = useProfilesQuery();
  const gameProfiles = profilesQuery.data || [];
  const isHost = gameProfiles?.[0]?.id === userQuery.data?.id;
  const me = gameProfiles?.find((profile) => profile.id === userQuery.data?.id);
  const notEnoughPlayers = gameProfiles?.length < 3;
  const url = window.location.href;
  const startGameMutation = useStartGameMutation();
  const gameLanguageMutation = useGameLanguageMutation();
  const isLoading = useIsLoading();

  return (
    <Container
      maxWidth="sm"
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 1,
        p: 2,
      }}
    >
      <Box sx={{ alignSelf: "flex-start" }}>
        <ButtonGoHome />
      </Box>
      <Typography sx={{ fontWeight: "bold", textAlign: "center" }}>
        Game Invite Link
      </Typography>
      <Box>
        <ButtonShare url={url} />
      </Box>
      <Typography sx={{ fontWeight: "bold", textAlign: "center" }}>
        Scan to join 👇
      </Typography>
      <QRShare url={url} />
      <Box sx={{ mb: 6 }}></Box>
      <Typography sx={{ fontWeight: "bold", textAlign: "center" }}>
        Group Chat Language
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
      <Box sx={{ mb: 6 }}></Box>
      <Typography sx={{ fontWeight: "bold", textAlign: "center" }}>
        {gameProfiles.length} Players Connected
      </Typography>
      <Box
        sx={{
          display: "flex",
          gap: 1,
          flexDirection: "row",
          flexWrap: "wrap",
          justifyContent: "center",
        }}
      >
        {gameProfiles?.map((profile) => (
          <Chip
            key={profile.id}
            label={`${profile.name} ${profile.id === me?.id ? "(you)" : ""}`}
          />
        ))}
      </Box>
      <Box sx={{ mb: 6 }}></Box>
      {isHost && (
        <Button
          component="button"
          color="secondary"
          variant="contained"
          onClick={() => startGameMutation.mutate()}
          disabled={isLoading || notEnoughPlayers}
          aria-label="Start Game"
        >
          Start Game
        </Button>
      )}
      {notEnoughPlayers && (
        <Typography>
          <strong>3+ players required</strong>, invite people to start!
        </Typography>
      )}
      {!isHost && (
        <Typography>
          <strong>Waiting for {gameProfiles?.[0]?.name}</strong> to start the
          game
        </Typography>
      )}
    </Container>
  );
};
