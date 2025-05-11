"use client";

import React, { useContext, useState } from "react";
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
import { ButtonCreateGame } from "./buttonCreateGame";
import { Send } from "@mui/icons-material";
import { ButtonJoinGame } from "./buttonJoinGame";
import { ButtonResumeGame } from "./buttonResumeGame";

export const SignUp: React.FC = () => {
  const user = useContext(UserContext);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");

  const signUp = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    try {
      if (user?.signUp) {
        await user.signUp(name);
      }
    } catch (error) {
      console.error(error);
    } finally {
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
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1, px: 2 }}>
        <Typography fontWeight={900} align="center" sx={{ my: 2 }}>
          In a group chat, an AI controls one of your friends.
        </Typography>
        <Typography>
          +1 🧠 for guessing <strong>who is the AI?</strong>
        </Typography>
        <Typography>
          +1 🧠 for convincing players you are the AI, as a human.
        </Typography>
        <Typography>
          +1 🧠 for convincing players you are a human, as the AI.
        </Typography>
        <Typography fontWeight={900} align="center" sx={{ my: 2 }}>
          Earn 10 🧠 to win
        </Typography>
      </Box>
      {user?.id ? (
        <>
          <ButtonResumeGame />
          <ButtonJoinGame />
          <ButtonCreateGame />
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
