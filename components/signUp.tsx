"use client";

import React, { useContext, useEffect, useState } from "react";
import { Box, Button, Container, TextField, Typography } from "@mui/material";
import { UserContext } from "./contextProvider";
import { Spinner } from "./spinner";
import { useRouter, useSearchParams } from "next/navigation";

export const SignUp: React.FC = () => {
  const user = useContext(UserContext);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [roomId, setRoomId] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const newRoomId = searchParams.get("room") ?? null;
    if (newRoomId?.length) {
      setRoomId(newRoomId);
    }
  }, [searchParams, router]);

  const signUp = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    await (user as any)?.signUp(name, roomId);
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
        The Turing Trial
      </Typography>

      <Typography>Will you know your friends from the AI?</Typography>

      <form onSubmit={signUp} style={{ width: "100%" }}>
        <Box
          sx={{
            display: "flex",
            alignContent: "center",
            justifyContent: "center",
            p: 1,
          }}
        >
          <TextField
            label="Name"
            value={name}
            onChange={(e: any) => setName(e.target.value)}
          />

          <Button
            type="submit"
            variant="contained"
            disabled={loading || name.length < 3}
          >
            Join
            {loading && <Spinner />}
          </Button>
        </Box>
      </form>
    </Container>
  );
};
