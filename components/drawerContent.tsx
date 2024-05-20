import React from "react";
import {
  List,
  ListItem,
  ListItemText,
  IconButton,
  ListItemButton,
} from "@mui/material";
import { ChevronLeft as ChevronLeftIcon } from "@mui/icons-material";

interface DrawerContentProps {
  onCloseButtonClick: () => void;
}

export const DrawerContent: React.FC<DrawerContentProps> = ({
  onCloseButtonClick,
}) => {
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
