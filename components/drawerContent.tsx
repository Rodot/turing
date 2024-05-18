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
import { GroupContext } from "./contextProvider";

interface DrawerContentProps {
  onCloseButtonClick: () => void;
}

export const DrawerContent: React.FC<DrawerContentProps> = ({
  onCloseButtonClick,
}) => {
  const group = useContext(GroupContext);

  const handleLeaveGroup = () => {
    group?.leaveGroup();
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
      {group?.id && (
        <ListItem>
          <ListItemButton onClick={handleLeaveGroup}>
            <ListItemText> Leave Group</ListItemText>
            <IconButton>
              <DeleteIcon />
            </IconButton>
          </ListItemButton>
        </ListItem>
      )}
    </List>
  );
};
