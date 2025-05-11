"use client";
import React from "react";
import { Chat } from "./chat";
import { Lobby } from "./lobby";
import { useRoomId } from "@/hooks/useRoomId";
import { Typography } from "@mui/material";
import { useRoomQuery } from "@/hooks/useRoomQuery";

export const GameRouter = () => {
  const roomQuery = useRoomQuery();
  const roomId = useRoomId();

  if (!roomQuery?.data?.id) {
    return <Typography>Loading...</Typography>;
  } else if (roomQuery.data.status === "lobby") {
    return <Lobby roomId={roomId} />;
  } else {
    return <Chat />;
  }
};
