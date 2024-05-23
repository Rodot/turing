"use client";
import React, { useContext, useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  SwipeableDrawer,
  Button,
} from "@mui/material";
import { Menu as MenuIcon } from "@mui/icons-material";
import {
  PlayersContext,
  RoomContext,
  UserProfileContext,
} from "./contextProvider";
import { DrawerContent } from "./drawerContent";
import { Chat } from "./chat";
import { Lobby } from "./lobby";
import { SignUp } from "./signUp";
import { ButtonLeaveGame } from "./buttonLeaveGame";

export const BaseLayout = () => {
  const userProfile = useContext(UserProfileContext);
  const room = useContext(RoomContext);
  const players = useContext(PlayersContext);
  const [open, setOpen] = useState(false);

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  const router = () => {
    if (!room?.data?.id) return <SignUp />;
    else if (room.data.status === "lobby") return <Lobby />;
    else return <Chat />;
  };

  return (
    <>
      <AppBar>
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerOpen}
          >
            <MenuIcon />
          </IconButton>
          <Typography sx={{ flexGrow: "1" }}>The Turing Trial</Typography>
          <Button color="secondary" href="https://betaLab.fr" target="_blank">
            By BetaLab.fr
          </Button>
        </Toolbar>
      </AppBar>
      <SwipeableDrawer
        anchor="left"
        onClose={handleDrawerClose}
        onOpen={handleDrawerOpen}
        open={open}
      >
        <DrawerContent onCloseButtonClick={handleDrawerClose} />
        <ButtonLeaveGame sx={{ mb: 16 }} />
        {/* room
        <pre>{JSON.stringify(room, null, 2)}</pre>
        userProfile
        <pre>{JSON.stringify(userProfile, null, 2)}</pre>
        players
        <pre>{JSON.stringify(players, null, 2)}</pre> */}
      </SwipeableDrawer>
      {router()}
    </>
  );
};
