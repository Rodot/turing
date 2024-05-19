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
import {
  RoomContextContext,
  RoomContextProfilesContext,
  UserContext,
} from "./contextProvider";
import { DrawerContent } from "./drawerContent";
import { GameCreate } from "./gameCreate";
import { Chat } from "./chat";

export const BaseLayout = () => {
  const user = useContext(UserContext);
  const room = useContext(RoomContextContext);
  const roomUsers = useContext(RoomContextProfilesContext);
  const [open, setOpen] = useState(false);

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
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
          {room?.id && (
            <Typography>
              🏠 {shortenId(room?.id)}
              👥 x {roomUsers.length} :{" "}
              {roomUsers.map((profile) => shortenId(profile.id)).join(" ")}
            </Typography>
          )}
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
      {!room?.id ? <GameCreate /> : <Chat />}
    </>
  );
};
