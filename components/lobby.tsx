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
import { useTranslation } from "react-i18next";

export const Lobby: React.FC = () => {
  const { t } = useTranslation();
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
          <strong>{t("lobby.playersRequired")}</strong>, invite people!
        </Typography>
      )}
      {enoughPlayers && !isHost && (
        <Typography>
          <strong>
            {t("lobby.waitingForStart", { player: gamePlayers?.[0]?.name })}
          </strong>
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
          {t("buttons.startGame")}
        </Button>
      )}

      {isHost && (
        <>
          <Box sx={{ mb: 4 }}></Box>

          <Typography sx={{ fontWeight: "bold", textAlign: "center" }}>
            {t("lobby.conversationLanguage")}
          </Typography>
          <ButtonGroup>
            <Button
              component="button"
              variant={gameQuery?.data?.lang === "en" ? "contained" : "text"}
              onClick={() => gameLanguageMutation.mutate("en")}
              disabled={gameLanguageMutation.isPending}
            >
              {t("lobby.languages.english")}
            </Button>
            <Button
              component="button"
              variant={gameQuery?.data?.lang === "fr" ? "contained" : "text"}
              onClick={() => gameLanguageMutation.mutate("fr")}
              disabled={gameLanguageMutation.isPending}
            >
              {t("lobby.languages.french")}
            </Button>
          </ButtonGroup>
        </>
      )}

      <Box sx={{ mb: 4 }}></Box>

      <Typography sx={{ fontWeight: "bold", textAlign: "center" }}>
        {t("lobby.inviteLink")}
      </Typography>
      <Box>
        <ButtonShare url={url} />
      </Box>

      <Box sx={{ mb: 2 }}></Box>

      <Typography sx={{ fontWeight: "bold", textAlign: "center" }}>
        {t("lobby.scanToJoin")}
      </Typography>
      <QRShare url={url} />
    </Container>
  );
};
