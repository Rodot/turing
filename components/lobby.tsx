"use client";

import React, { useContext, useState } from "react";
import {
  Box,
  Button,
  ButtonGroup,
  Chip,
  Container,
  Toolbar,
  Typography,
} from "@mui/material";
import { RoomContext, RoomProfilesContext } from "./contextProvider";
import { ButtonShare } from "./buttonShare";
import { QRShare } from "./qrShare";
import { Spinner } from "./spinner";
import { updateRoom } from "@/queries/db/room.query";
import { supabase } from "@/utils/supabase/client";
import { useUserQuery } from "@/hooks/useUserQuery";

interface LobbyProps {
  roomId: string;
}

export const Lobby: React.FC<LobbyProps> = ({ roomId }) => {
  const userQuery = useUserQuery();
  const room = useContext(RoomContext);
  const roomProfiles = useContext(RoomProfilesContext);
  const [loadingStart, setLoadingStart] = useState(false);
  const [loadingLang, setLoadingLang] = useState(false);
  const isHost = roomProfiles?.[0]?.id === userQuery.data?.id;
  const me = roomProfiles?.find((profile) => profile.id === userQuery.data?.id);
  const notEnoughPlayers = roomProfiles?.length < 3;
  const url = window.location.host + "?room=" + roomId;

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
    if (!roomId) return;
    try {
      setLoadingLang(true);
      updateRoom(supabase, roomId, { lang });
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingLang(false);
    }
  };

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
      {isHost && (
        <ButtonGroup>
          <Button
            component="button"
            variant={room?.data?.lang === "en" ? "contained" : "text"}
            onClick={() => setLang("en")}
            disabled={loadingLang}
          >
            English
            {loadingLang && <Spinner />}
          </Button>
          <Button
            component="button"
            variant={room?.data?.lang === "fr" ? "contained" : "text"}
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
          component="button"
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
