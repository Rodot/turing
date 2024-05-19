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
import { shortenId } from "@/utils/user";
import { RoomContext, UserContext } from "./contextProvider";
import { DrawerContent } from "./drawerContent";
import { GameCreate } from "./gameCreate";
import { Chat } from "./chat";
import { Lobby } from "./lobby";

export const BaseLayout = () => {
  const user = useContext(UserContext);
  const room = useContext(RoomContext);
  const [open, setOpen] = useState(false);

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  const router = () => {
    if (!room?.data?.id) return <GameCreate />;
    if (room.data.state === "lobby") return <Lobby />;
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
          <Typography>👤 {shortenId(user?.id)}</Typography>
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
      </SwipeableDrawer>
      {router()}
    </>
  );
};
