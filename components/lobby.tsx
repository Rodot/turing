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

      {notEnoughPlayers && (
        <Typography>
          <strong>3+ players required</strong>, invite people to start!
        </Typography>
      )}
      {!notEnoughPlayers && !isHost && (
        <Typography>
          <strong>Waiting for {roomProfiles?.[0]?.name}</strong>{" "}
          to start the game 😅
        </Typography>
      )}

      <ButtonShare url={url} sx={{ mt: 6 }} />
      <QRCode size={150} value={url} />
      <Typography sx={{ mb: 6 }}>👆 Scan to join</Typography>

      <Box
        sx={{
          display: "flex",
          gap: 1,
          flexDirection: "row",
          flexWrap: "wrap",
          justifyContent: "center",
          mb: 6,
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

      {isHost && (
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
      )}

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
    </Container>
  );
};
