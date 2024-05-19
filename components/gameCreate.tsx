"use client";

import React, { useContext } from "react";
import { Button, Container, Typography } from "@mui/material";

import { RoomContextContext } from "./contextProvider";

export const GameCreate: React.FC = () => {
  const room = useContext(RoomContextContext);
  const startNewGame = async () => {
    room?.createRoomContext();
  };

  return (
    <Container maxWidth="sm">
      <Button variant="contained" onClick={startNewGame}>
        Start New Game
      </Button>
      <Typography>
        ... or to join a friend's game, ask them to send you the link.
      </Typography>
    </Container>
  );
};
