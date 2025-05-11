"use client";
import React from "react";
import { Chat } from "./chat";
import { Lobby } from "./lobby";
import { useRoomQuery } from "@/hooks/useRoomQuery";
import { SignUp } from "./signUp";
import { Spinner } from "./spinner";
import { useProfileQuery } from "@/hooks/useProfileQuery";
import { Typography } from "@mui/material";

export const GameRouter = () => {
  const roomQuery = useRoomQuery();
  const profileQuery = useProfileQuery();
  const notInRoom = roomQuery?.data?.id !== profileQuery?.data?.room_id;

  if (!roomQuery?.data?.status) {
    return <Spinner />;
  }

  if (notInRoom) {
    return <SignUp />;
  }

  if (roomQuery.data?.status === "lobby") {
    <Typography>lobby</Typography>;
    return <Lobby />;
  }

  return <Chat />;
};
