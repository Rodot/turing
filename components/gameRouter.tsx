"use client";
import React, { useContext } from "react";
import { RoomContext } from "./contextProvider";
import { Chat } from "./chat";
import { Lobby } from "./lobby";
import { useRoomId } from "@/hooks/useRoomId";
import { Typography } from "@mui/material";

export const GameRouter = () => {
  const room = useContext(RoomContext);
  const roomId = useRoomId();

  if (!room?.data?.id) {
    return <Typography>Loading...</Typography>;
  } else if (room.data.status === "lobby") {
    return <Lobby roomId={roomId} />;
  } else {
    return <Chat />;
  }
};
