"use client";

import React, { useContext, useEffect, useState } from "react";
import { Button, Container, Typography } from "@mui/material";
import { RoomContext, UserContext } from "./contextProvider";
import { Spinner } from "./spinner";

export const GameCreate: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const room = useContext(RoomContext);
  const user = useContext(UserContext);
  const startNewGame = async () => {
    setLoading(true);
    room?.createRoom();
  };

  useEffect(() => {
    if (user?.id) {
      setLoading(false);
    } else {
      setLoading(true);
    }
  }, [user?.id]);

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
        The Turing Trial
      </Typography>
      <Button variant="contained" onClick={startNewGame} disabled={loading}>
        Start New Game
        {loading && <Spinner />}
      </Button>
      <Typography sx={{ textAlign: "center" }}>
        ...or to join a friend's game, ask them to send you the link.
      </Typography>
    </Container>
  );
};
