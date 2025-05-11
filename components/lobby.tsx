"use client";

import React, { useContext } from "react";
import {
  Box,
  Button,
  ButtonGroup,
  Chip,
  Container,
  Toolbar,
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

interface LobbyProps {
  roomId: string;
}

export const Lobby: React.FC<LobbyProps> = ({ roomId }) => {
  const userQuery = useUserQuery();
  const roomQuery = useRoomQuery();
  const roomProfiles = useContext(RoomProfilesContext);
  const isHost = roomProfiles?.[0]?.id === userQuery.data?.id;
  const me = roomProfiles?.find((profile) => profile.id === userQuery.data?.id);
  const notEnoughPlayers = roomProfiles?.length < 3;
  const url = window.location.host + "?room=" + roomId;
  const startGameMutation = useStartGameMutation();
  const roomLanguageMutation = useRoomLanguageMutation();

  return (
    <Container
      maxWidth="sm"
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 2,
        p: 2,
      }}
    >
      <Toolbar /> {/* empty toolbar to avoid covering page content */}
      {notEnoughPlayers && (
        <Typography>
          <strong>3+ players required</strong>, invite people to start!
        </Typography>
      )}
      {!notEnoughPlayers && !isHost && (
        <Typography>
          <strong>Waiting for {roomProfiles?.[0]?.name}</strong> to start the
          game 😅
        </Typography>
      )}
      <Box sx={{ mt: 6 }}>
        <ButtonShare url={url} />
      </Box>
      <QRShare url={url} />
      <Box
        sx={{
          display: "flex",
          gap: 1,
          flexDirection: "row",
          flexWrap: "wrap",
          justifyContent: "center",
          my: 6,
        }}
      >
        <Chip
          label={`${roomProfiles.length} Players`}
          sx={{ bgcolor: "primary.main", color: "background.paper" }}
        />
        {roomProfiles?.map((profile) => (
          <Chip
            key={profile.id}
            label={`${profile.name} ${profile.id === me?.id ? "(you)" : ""}`}
          />
        ))}
      </Box>
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
    </Container>
  );
};
