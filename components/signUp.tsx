"use client";

import React, { useContext, useEffect, useState } from "react";
import {
  Box,
  Button,
  Container,
  TextField,
  Toolbar,
  Typography,
} from "@mui/material";
import { UserContext } from "./contextProvider";
import { Spinner } from "./spinner";
import { useRouter, useSearchParams } from "next/navigation";
import { ButtonCreateGame } from "./buttonCreateGame";
import { Send } from "@mui/icons-material";

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
    try {
      await (user as any)?.signUp(name, roomId);
    } catch (error) {
      console.error(error);
    } finally {
      setRoomId(null);
      router.push("/");
      setLoading(false);
    }
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
      <Typography>Can you distinguish your friend from AIs?</Typography>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1, px: 2 }}>
        <Typography variant="h6" color="primary" fontWeight={900}>
          Rules
        </Typography>
        <Typography>
          <strong>1.</strong> You are in a group chat... but one of the players
          is be possessed by an AI, which will pretend to be the player.
        </Typography>
        <Typography>
          <strong>2.</strong> At the end of a round, guess who was possessed to
          get 1 🧠. The possessed player gets 1 🧠 by remaining undetected.
        </Typography>
        <Typography>
          <strong>3.</strong> Get 5 🧠 to win.
        </Typography>
      </Box>
      {user?.id ? (
        <>
          <ButtonCreateGame />
          <Typography sx={{ textAlign: "center" }}>
            ...or ask a friend for their game&apos;s link.
          </Typography>
        </>
      ) : (
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
              label="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              sx={{ mr: 1 }}
            />

            <Button
              type="submit"
              variant="contained"
              color="secondary"
              disabled={loading || name.length < 3}
            >
              <Send />
              {loading && <Spinner />}
            </Button>
          </Box>
        </form>
      )}
    </Container>
  );
};
