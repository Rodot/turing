"use client";

import React, { useContext } from "react";
import { Button, Container, Typography } from "@mui/material";

import { GroupContext } from "./contextProvider";

export const GameCreate: React.FC = () => {
  const group = useContext(GroupContext);
  const startNewGame = async () => {
    group?.createGroup();
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
