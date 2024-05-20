"use client";
import React, { useContext, useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  SwipeableDrawer,
} from "@mui/material";
import { Menu as MenuIcon } from "@mui/icons-material";
import {
  PlayersContext,
  RoomContext,
  UserProfileContext,
} from "./contextProvider";
import { DrawerContent } from "./drawerContent";
import { GameCreate } from "./gameCreate";
import { Chat } from "./chat";
import { Lobby } from "./lobby";
import { SignUp } from "./signUp";

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
    if (!userProfile?.id) return <SignUp />;
    if (!room?.data?.id) return <GameCreate />;
    if (room.data.status === "lobby") return <Lobby />;
    return <Chat />;
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
          <Typography>{userProfile?.name}</Typography>
        </Toolbar>
      </AppBar>
      <Toolbar /> {/* empty toolbar to avoid covering page content */}
      <SwipeableDrawer
        anchor="left"
        onClose={handleDrawerClose}
        onOpen={handleDrawerOpen}
        open={open}
      >
        <DrawerContent onCloseButtonClick={handleDrawerClose} />
        userProfile
        <pre>{JSON.stringify(userProfile, null, 2)}</pre>
        room
        <pre>{JSON.stringify(room, null, 2)}</pre>
        players
        <pre>{JSON.stringify(players, null, 2)}</pre>
      </SwipeableDrawer>
      {router()}
    </>
  );
};
