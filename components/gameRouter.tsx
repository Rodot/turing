"use client";
import React from "react";
import { Chat } from "./chat";
import { Lobby } from "./lobby";
import { useGameQuery } from "@/hooks/useGameQuery";
import { SignUp } from "./signUp";
import { useGameIdFromUrl } from "@/hooks/useGameIdFromUrl";
import { useProfileQuery } from "@/hooks/useProfileQuery";

export const GameRouter = () => {
  const gameIdFromUrl = useGameIdFromUrl();
  const gameQuery = useGameQuery();
  const profile = useProfileQuery();
  const isInGameFromUrl = gameIdFromUrl === profile.data?.game_id;

  if (!gameIdFromUrl || !isInGameFromUrl) {
    return <SignUp />;
  }

  if (gameQuery.data?.status === "lobby") {
    return <Lobby />;
  }

  return <Chat />;
};
