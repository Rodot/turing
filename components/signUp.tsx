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
      <Typography>Can you distinguish your friends from the AIs?</Typography>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1, px: 2 }}>
        <Typography variant="h6" color="primary" fontWeight={900}>
          Rules
        </Typography>
        <Typography>
          <strong>1.</strong> Everybody talk in a group chat. A random 🧑 human
          player is 🤖 possessed by the AI, which will send messages in her
          name.
        </Typography>
        <Typography>
          <strong>2.</strong> At the end of the round, the 🧑 humans have to
          guess who was 🤖 possessed and vote to ⚡ exorcise her.
        </Typography>
        <Typography>
          <strong>3.</strong> If you were 🧑 human and correctly voted against
          the 🤖 possessed, you get +1 🧠. If you were 🤖 possessed and avoided
          getting ⚡ exorcised, you get +1 🧠
        </Typography>
        <Typography>
          <strong>4.</strong> First one to get 5 🧠 wins.
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
              label="Name"
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
              Play
              {loading && <Spinner />}
            </Button>
          </Box>
        </form>
      )}
    </Container>
  );
};
