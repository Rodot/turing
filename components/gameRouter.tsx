"use client";
import React from "react";
import { Chat } from "./chat";
import { Lobby } from "./lobby";
import { useGameQuery } from "@/hooks/useGameQuery";
import { SignUp } from "./signUp";
import { useProfileQuery } from "@/hooks/useProfileQuery";
import { Typography } from "@mui/material";

export const GameRouter = () => {
  const gameQuery = useGameQuery();
  const profileQuery = useProfileQuery();
  const notInGame = gameQuery?.data?.id !== profileQuery?.data?.game_id;

  if (!gameQuery?.data?.status || notInGame) {
    return <SignUp />;
  }

  if (gameQuery.data?.status === "lobby") {
    <Typography>lobby</Typography>;
    return <Lobby />;
  }

  return <Chat />;
};
