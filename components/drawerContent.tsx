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
import { RoomContextContext } from "./contextProvider";

interface DrawerContentProps {
  onCloseButtonClick: () => void;
}

export const DrawerContent: React.FC<DrawerContentProps> = ({
  onCloseButtonClick,
}) => {
  const room = useContext(RoomContextContext);

  const handleLeaveRoomContext = () => {
    room?.leaveRoomContext();
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
      {room?.id && (
        <ListItem>
          <ListItemButton onClick={handleLeaveRoomContext}>
            <ListItemText> Leave RoomContext</ListItemText>
            <IconButton>
              <DeleteIcon />
            </IconButton>
          </ListItemButton>
        </ListItem>
      )}
    </List>
  );
};
