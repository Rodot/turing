"use client";

import React, { ReactNode, useContext, useState } from "react";
import {
  AppBar,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Toolbar,
  Typography,
  IconButton,
  ListItemIcon,
  SwipeableDrawer,
} from "@mui/material";
import {
  Menu as MenuIcon,
  ChevronLeft as ChevronLeftIcon,
} from "@mui/icons-material";
import { formatUser, shortenId } from "@/utils/user";
import { GroupContext, UserContext } from "./contextProvider";

type BaseLayoutProps = {
  children: ReactNode;
};

const BaseLayout = ({ children }: BaseLayoutProps) => {
  const user = useContext(UserContext);
  const group = useContext(GroupContext);
  const [open, setOpen] = useState(false);

  const drawerWidth = 240;

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
          <Typography>
            Welcome {formatUser(user)} ! In group :{" "}
            {group?.usersId.map((user) => shortenId(user)).join(", ")}
          </Typography>
        </Toolbar>
      </AppBar>
      <Toolbar /> {/* empty toolbar to avoid covering page content */}
      <SwipeableDrawer
        anchor="left"
        onClose={handleDrawerClose}
        onOpen={handleDrawerOpen}
        open={open}
        sx={{
          minWidth: drawerWidth,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            minWidth: drawerWidth,
            boxSizing: "border-box",
          },
        }}
      >
        <List>
          <ListItem
            onClick={handleDrawerClose}
            secondaryAction={
              <IconButton edge="end" aria-label="comments">
                <ChevronLeftIcon />
              </IconButton>
            }
          >
            <ListItemText> Turing Trial </ListItemText>
          </ListItem>
        </List>
      </SwipeableDrawer>
      {children}
    </>
  );
};

export default BaseLayout;
