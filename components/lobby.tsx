"use client";

import React, { useContext, useEffect, useState } from "react";
import { Box, Button, Chip, Container, Typography } from "@mui/material";
import {
  RoomContext,
  RoomProfilesContext,
  UserContext,
} from "./contextProvider";
import { ButtonShare } from "./buttonShare";
import { Logout } from "@mui/icons-material";
import { Spinner } from "./spinner";
import QRCode from "react-qr-code";

export const Lobby: React.FC = () => {
  const user = useContext(UserContext);
  const room = useContext(RoomContext);
  const roomProfiles = useContext(RoomProfilesContext);
  const [loading, setLoading] = useState(false);
  const [url, setUrl] = useState("");
  const isHost = roomProfiles?.[0]?.id === user?.id;
  const me = roomProfiles?.find((profile) => profile.id === user?.id);

  const startGame = async () => {
    setLoading(true);
    room?.startGame();
  };

  const leaveGame = async () => {
    setLoading(true);
    room?.leaveRoom();
  };

  useEffect(() => {
    setUrl(window.location.href + "?room=" + room?.data?.id);
  }, [room?.data?.id]);

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
      <Typography variant="h4" color="primary">
        Invite players
      </Typography>
      <Typography sx={{ textAlign: "center" }}>
        Ask players to scan the QR or send them the game link
      </Typography>

      <QRCode size={150} value={url} />
      <ButtonShare url={url} sx={{ mb: 4 }} />

      <Typography variant="h4" color="primary">
        {isHost ? "Ready?" : "Get ready..."}
      </Typography>

      <Typography>
        {isHost
          ? "Star the game once all players are here"
          : `Wait for ${roomProfiles?.[0]?.name} to start the game`}
      </Typography>
      <Box
        sx={{
          display: "flex",
          gap: 1,
          flexDirection: "column",
        }}
      >
        {roomProfiles?.map((profile) => (
          <Chip
            key={profile.id}
            label={`${profile.name} ${profile.id === me?.id ? "(you)" : ""}`}
          />
        ))}
      </Box>

      {isHost && (
        <Button variant="contained" onClick={startGame} disabled={loading}>
          Start Game
          {loading && <Spinner />}
        </Button>
      )}

      <Button color="error" onClick={leaveGame} disabled={loading}>
        <Logout sx={{ mr: 1 }} />
        Leave Game
      </Button>
    </Container>
  );
};
