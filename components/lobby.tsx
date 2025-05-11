"use client";

import React, { useContext } from "react";
import {
  Box,
  Button,
  ButtonGroup,
  Chip,
  Container,
  Typography,
} from "@mui/material";
import { RoomProfilesContext } from "./contextProvider";
import { ButtonShare } from "./buttonShare";
import { QRShare } from "./qrShare";
import { Spinner } from "./spinner";
import { useUserQuery } from "@/hooks/useUserQuery";
import {
  useRoomLanguageMutation,
  useRoomQuery,
  useStartGameMutation,
} from "@/hooks/useRoomQuery";

export const Lobby: React.FC = () => {
  const userQuery = useUserQuery();
  const roomQuery = useRoomQuery();
  const roomProfiles = useContext(RoomProfilesContext);
  const isHost = roomProfiles?.[0]?.id === userQuery.data?.id;
  const me = roomProfiles?.find((profile) => profile.id === userQuery.data?.id);
  const notEnoughPlayers = roomProfiles?.length < 2;
  const url = window.location.href;
  const startGameMutation = useStartGameMutation();
  const roomLanguageMutation = useRoomLanguageMutation();

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
      <Box sx={{ mb: 6 }}></Box>
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
          variant={roomQuery?.data?.lang === "en" ? "contained" : "text"}
          onClick={() => roomLanguageMutation.mutate("en")}
          disabled={roomLanguageMutation.isPending}
        >
          English
          {roomLanguageMutation.isPending && <Spinner />}
        </Button>
        <Button
          component="button"
          variant={roomQuery?.data?.lang === "fr" ? "contained" : "text"}
          onClick={() => roomLanguageMutation.mutate("fr")}
          disabled={roomLanguageMutation.isPending}
        >
          French
          {roomLanguageMutation.isPending && <Spinner />}
        </Button>
      </ButtonGroup>
      <Box sx={{ mb: 6 }}></Box>
      <Typography sx={{ fontWeight: "bold", textAlign: "center" }}>
        {roomProfiles.length} Players Connected
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
        {roomProfiles?.map((profile) => (
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
          disabled={startGameMutation.isPending || notEnoughPlayers}
        >
          Start Game
          {startGameMutation.isPending && <Spinner />}
        </Button>
      )}
      {notEnoughPlayers && (
        <Typography>
          <strong>3+ players required</strong>, invite people to start!
        </Typography>
      )}
      {!isHost && (
        <Typography>
          <strong>Waiting for {roomProfiles?.[0]?.name}</strong> to start the
          game
        </Typography>
      )}
    </Container>
  );
};
