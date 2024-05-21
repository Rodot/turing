"use client";

import React, { useContext, useState } from "react";
import { Button, Container, Toolbar, Typography } from "@mui/material";
import { RoomContext } from "./contextProvider";
import { Spinner } from "./spinner";

export const GameCreate: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const room = useContext(RoomContext);
  const startNewGame = async () => {
    setLoading(true);
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
        gap: 2,
        p: 2,
      }}
    >
      <Toolbar /> {/* empty toolbar to avoid covering page content */}
      <Typography variant="h4" color="primary" fontWeight={900}>
        The Turing <strong>Trial</strong>
      </Typography>
      <Button
        color="secondary"
        variant="contained"
        onClick={startNewGame}
        disabled={loading}
      >
        New Game
        {loading && <Spinner />}
      </Button>
      <Typography sx={{ textAlign: "center" }}>
        ...or ask a friend for their game&apos;s link.
      </Typography>
    </Container>
  );
};
