"use client";

import React, { useEffect, useState } from "react";
import { Box, Button, Container, TextField, Typography } from "@mui/material";
import { ButtonCreateGame } from "./buttonCreateGame";
import { Send } from "@mui/icons-material";
import { ButtonJoinGame } from "./buttonJoinGame";
import { ButtonResumeGame } from "./buttonResumeGame";
import {
  useProfileNameMutation,
  useProfileQuery,
} from "@/hooks/useProfileQuery";
import { useUserQuery } from "@/hooks/useUserQuery";

export const SignUp: React.FC = () => {
  const userQuery = useUserQuery();
  const profileQuery = useProfileQuery();
  const profileNameMutation = useProfileNameMutation();
  const [name, setName] = useState("");
  const isNameSet = (profileQuery?.data?.name?.length ?? 0) > 1;
  const isProfileLoading = profileQuery.isLoading || userQuery.isLoading;

  useEffect(() => {
    if (profileQuery.data?.name) {
      setName(profileQuery.data.name);
    }
  }, [profileQuery.data]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Submitting name", name);
    if (name.length >= 3) {
      profileNameMutation.mutate(name);
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

      {!isProfileLoading && !isNameSet && (
        <form onSubmit={onSubmit} style={{ width: "100%" }}>
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
              aria-label="Submit"
              disabled={
                profileQuery.isLoading ||
                profileNameMutation.isPending ||
                name.length < 3
              }
            >
              <Send />
            </Button>
          </Box>
        </form>
      )}
      {isNameSet && (
        <>
          <ButtonResumeGame />
          <ButtonJoinGame />
          <ButtonCreateGame />
        </>
      )}
    </Container>
  );
};
