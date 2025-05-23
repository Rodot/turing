"use client";

import React, { useEffect, useState } from "react";
import { Box, Button, Container, TextField, Typography } from "@mui/material";
import { ButtonCreateGame } from "./buttonCreateGame";
import { Send } from "@mui/icons-material";
import { ButtonJoinGame } from "./buttonJoinGame";
import { ButtonResumeGame } from "./buttonResumeGame";
import { useProfileQuery } from "@/hooks/useProfileQuery";
import { useProfileNameMutation } from "@/hooks/useProfileMutation";
import { ButtonEndGame } from "./buttonEndGame";
import { useGameIdFromUrl } from "@/hooks/useGameIdFromUrl";
import { useIsAnythingLoading } from "@/hooks/useIsAnythingLoading";

export const SignUp: React.FC = () => {
  const profileQuery = useProfileQuery();
  const profileNameMutation = useProfileNameMutation();
  const [name, setName] = useState("");
  const isNameSet = (profileQuery?.data?.name?.length ?? 0) > 1;
  const urlGameId = useGameIdFromUrl();
  const isAnythingLoading = useIsAnythingLoading();

  const profileGameId = profileQuery.data?.game_id ?? undefined;

  const isResumeGameVisible = !!profileGameId && !urlGameId;
  const isLeaveGameVisible = !!profileGameId && !urlGameId;
  const isJoinGameVisible = !!urlGameId;
  const isCreateGameVisible = !profileGameId && !urlGameId;

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
        p: 2,
      }}
    >
      <Box sx={{ bgcolor: "primary.main", width: "100%", py: 2 }}>
        <Typography
          sx={{ fontWeight: "900", color: "white" }}
          variant="h4"
          align="center"
        >
          The Turing <strong>Trial</strong>
        </Typography>
      </Box>

      <Box sx={{ my: 4 }}>
        <Typography fontWeight={900} align="center">
          An AI controls someone in the chat.
        </Typography>
        <Typography align="center" sx={{ fontStyle: "italic" }}>
          Will you tell your friends from the AI?
        </Typography>
      </Box>

      <Box sx={{ alignSelf: "center" }}>
        <Typography>
          +1 🧠 Guess <strong>who is the AI?</strong>
        </Typography>
        <Typography>+1 🧠 Be mistaken for the AI (if human)</Typography>
        <Typography>+1 🧠 Pass as human (if AI)</Typography>
      </Box>

      <Typography fontWeight={900} align="center" sx={{ my: 4 }}>
        Earn 5 🧠 to win
      </Typography>

      {!isAnythingLoading && !isNameSet && (
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
      {!isAnythingLoading && isNameSet && (
        <>
          {isResumeGameVisible && <ButtonResumeGame />}
          {isLeaveGameVisible && <ButtonEndGame />}
          {isJoinGameVisible && <ButtonJoinGame />}
          {isCreateGameVisible && <ButtonCreateGame />}
        </>
      )}
    </Container>
  );
};
