"use client";
import React, { useContext } from "react";
import { AppBar, Toolbar, Typography } from "@mui/material";
import { RoomContext } from "./contextProvider";
import { Chat } from "./chat";
import { Lobby } from "./lobby";
import { SignUp } from "./signUp";
import { ButtonLeaveGame } from "./buttonLeaveGame";

export const BaseLayout = () => {
  const room = useContext(RoomContext);

  const router = () => {
    if (!room?.data?.id) return <SignUp />;
    else if (room.data.status === "lobby") return <Lobby />;
    else return <Chat />;
  };

  return (
    <>
      <AppBar>
        <Toolbar>
          <Typography sx={{ flexGrow: "1", fontWeight: "900" }}>
            The Turing <strong>Trial</strong>
          </Typography>

          <ButtonLeaveGame label={"leave"} />
        </Toolbar>
      </AppBar>
      {router()}
    </>
  );
};
