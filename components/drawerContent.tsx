import React, { useContext } from "react";
import {
  List,
  ListItem,
  ListItemText,
  IconButton,
  ListItemButton,
} from "@mui/material";
import {
  ChevronLeft as ChevronLeftIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import { RoomContext } from "./contextProvider";

interface DrawerContentProps {
  onCloseButtonClick: () => void;
}

export const DrawerContent: React.FC<DrawerContentProps> = ({
  onCloseButtonClick,
}) => {
  const room = useContext(RoomContext);

  const handleLeaveRoom = () => {
    room?.leaveRoom();
    onCloseButtonClick();
  };

  return (
    <List>
      <ListItem>
        <ListItemButton onClick={onCloseButtonClick}>
          <ListItemText> The Turing Trial</ListItemText>
          <IconButton edge="end">
            <ChevronLeftIcon />
          </IconButton>
        </ListItemButton>
      </ListItem>
    </List>
  );
};
