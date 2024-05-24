"use client";

import React, { useContext, useEffect, useState } from "react";
import {
  Box,
  Button,
  Chip,
  Container,
  Toolbar,
  Typography,
} from "@mui/material";
import {
  RoomContext,
  RoomProfilesContext,
  UserContext,
} from "./contextProvider";
import { ButtonShare } from "./buttonShare";
import { Spinner } from "./spinner";
import QRCode from "react-qr-code";
import { ButtonLeaveGame } from "./buttonLeaveGame";

export const Lobby: React.FC = () => {
  const user = useContext(UserContext);
  const room = useContext(RoomContext);
  const roomProfiles = useContext(RoomProfilesContext);
  const [loading, setLoading] = useState(false);
  const [url, setUrl] = useState("");
  const isHost = roomProfiles?.[0]?.id === user?.id;
  const me = roomProfiles?.find((profile) => profile.id === user?.id);
  const notEnoughPlayers = roomProfiles?.length < 3;

  const startGame = async () => {
    try {
      setLoading(true);
      room?.startGame();
    } catch (error) {
      console.error("Failed to start game", error);
    } finally {
      setLoading(false);
    }
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
      <Toolbar /> {/* empty toolbar to avoid covering page content */}
      <Typography variant="h4" color="primary" fontWeight={900}>
        Invite <strong>humans</strong>
      </Typography>
      <Typography sx={{ textAlign: "center" }}>
        Ask players to scan the QR or send them the link
      </Typography>
      <QRCode size={150} value={url} />
      <ButtonShare url={url} sx={{ mb: 4 }} />
      <Typography variant="h4" color="primary" fontWeight={900}>
        {isHost ? "Ready?" : "Get ready..."}
      </Typography>
      <Typography>
        {isHost
          ? "Start once all players are here"
          : `Waiting for ${roomProfiles?.[0]?.name} to start the game`}
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
      {notEnoughPlayers && (
        <Typography color="error">
          At least 3 players required to play, invite somebody!
        </Typography>
      )}
      {isHost && (
        <Button
          color="secondary"
          variant="contained"
          onClick={startGame}
          disabled={loading || notEnoughPlayers}
        >
          Start Game
          {loading && <Spinner />}
        </Button>
      )}
      <ButtonLeaveGame sx={{ mt: 4 }} />
    </Container>
  );
};
