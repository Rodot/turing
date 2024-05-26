"use client";

import React, { useContext, useEffect, useState } from "react";
import {
  Box,
  Button,
  ButtonGroup,
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
import { updateRoom } from "@/queries/db/room.query";
import { supabase } from "@/utils/supabase/client";

export const Lobby: React.FC = () => {
  const user = useContext(UserContext);
  const room = useContext(RoomContext);
  const roomProfiles = useContext(RoomProfilesContext);
  const [loadingStart, setLoadingStart] = useState(false);
  const [loadingLang, setLoadingLang] = useState(false);
  const [url, setUrl] = useState("");

  const isHost = roomProfiles?.[0]?.id === user?.id;
  const me = roomProfiles?.find((profile) => profile.id === user?.id);
  const notEnoughPlayers = roomProfiles?.length < 3;

  const startGame = async () => {
    try {
      setLoadingStart(true);
      room?.startGame();
    } catch (error) {
      console.error("Failed to start game", error);
    } finally {
      setLoadingStart(false);
    }
  };

  const setLang = async (lang: "en" | "fr") => {
    if (!room?.data?.id) return;
    try {
      setLoadingLang(true);
      updateRoom(supabase, room?.data?.id, { lang });
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingLang(false);
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
      <ButtonGroup>
        <Button
          variant={room?.data?.lang === "en" ? "contained" : undefined}
          onClick={() => setLang("en")}
          disabled={loadingLang}
        >
          English
          {loadingLang && <Spinner />}
        </Button>
        <Button
          variant={room?.data?.lang === "fr" ? "contained" : undefined}
          onClick={() => setLang("fr")}
          disabled={loadingLang}
        >
          French
          {loadingLang && <Spinner />}
        </Button>
      </ButtonGroup>
      <Typography>
        {!isHost && `Waiting for ${roomProfiles?.[0]?.name} to start the game`}
      </Typography>
      {isHost && (
        <Button
          color="secondary"
          variant="contained"
          onClick={startGame}
          disabled={loadingStart || notEnoughPlayers}
        >
          Start Game
          {loadingStart && <Spinner />}
        </Button>
      )}
      {notEnoughPlayers && (
        <Typography color="error">
          3 or more players required to play
        </Typography>
      )}
      <ButtonLeaveGame sx={{ mt: 4 }} label={"Leave Game"} />
    </Container>
  );
};
