"use client";

import React, { useContext } from "react";
import { Button, Container, Typography } from "@mui/material";

import { RoomContext } from "./contextProvider";

export const GameCreate: React.FC = () => {
  const room = useContext(RoomContext);
  const startNewGame = async () => {
    room?.createRoom();
  };

  return (
    <Container
      maxWidth="sm"
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "1rem",
        padding: "1rem",
      }}
    >
      <Button variant="contained" onClick={startNewGame}>
        Start New Game
      </Button>
      <Typography sx={{ textAlign: "center" }}>
        ... or to join a friend's game, ask them to send you the link.
      </Typography>
    </Container>
  );
};
