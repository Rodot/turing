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
import { formatUser, shortenId } from "@/utils/user";
import {
  GroupContext,
  GroupProfilesContext,
  UserContext,
} from "./contextProvider";
import { DrawerContent } from "./drawerContent";

export const BaseLayout = ({ children }: { children: React.ReactNode }) => {
  const user = useContext(UserContext);
  const group = useContext(GroupContext);
  const groupUsers = useContext(GroupProfilesContext);
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
          {group?.id && (
            <Typography>
              🏠 {shortenId(group?.id)}
              👥 x {groupUsers.length} :{" "}
              {groupUsers.map((profile) => shortenId(profile.id)).join(" ")}
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
      {children}
    </>
  );
};
