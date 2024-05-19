"use client";

import React, { useContext, useState } from "react";
import { Button, Chip, Container, Typography } from "@mui/material";
import {
  RoomContext,
  RoomProfilesContext,
  UserContext,
} from "./contextProvider";
import { ButtonShare } from "./buttonShare";
import { Logout } from "@mui/icons-material";
import { Spinner } from "./spinner";

export const Lobby: React.FC = () => {
  const user = useContext(UserContext);
  const room = useContext(RoomContext);
  const roomProfiles = useContext(RoomProfilesContext);
  const [loading, setLoading] = useState(false);
  const isHost = roomProfiles?.[0]?.id === user?.id;

  const startGame = async () => {
    setLoading(true);
    room?.startGame();
  };

  const leaveGame = async () => {
    setLoading(true);
    room?.leaveRoom();
  };

  return (
    <Container
      maxWidth="sm"
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 2,
        p: 2,
      }}
    >
      <Typography variant="h4" color="primary">
        Lobby
      </Typography>

      {roomProfiles?.map((profile) => (
        <Chip key={profile.id} label={profile.name} />
      ))}

      <ButtonShare />

      {isHost ? (
        <Button variant="contained" onClick={startGame} disabled={loading}>
          Start Game
          {loading && <Spinner />}
        </Button>
      ) : (
        <Typography>Waiting for the host to start the game</Typography>
      )}

      <Button color="error" onClick={leaveGame} disabled={loading}>
        <Logout sx={{ mr: 1 }} />
        Leave Lobby
      </Button>
    </Container>
  );
};
