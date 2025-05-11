"use client";
import React, { useContext } from "react";
import { RoomContext } from "./contextProvider";
import { Chat } from "./chat";
import { Lobby } from "./lobby";

export const GameRouter = () => {
  const room = useContext(RoomContext);

  if (!room?.data?.id) {
    return null;
  } else if (room.data.status === "lobby") {
    return <Lobby />;
  } else {
    return <Chat />;
  }
};
