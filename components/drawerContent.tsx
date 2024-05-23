import React, { useContext } from "react";
import {
  List,
  ListItem,
  ListItemText,
  IconButton,
  ListItemButton,
} from "@mui/material";
import { ChevronLeft as ChevronLeftIcon } from "@mui/icons-material";
import { PlayersContext } from "./contextProvider";

interface DrawerContentProps {
  onCloseButtonClick: () => void;
}

export const DrawerContent: React.FC<DrawerContentProps> = ({
  onCloseButtonClick,
}) => {
  const players = useContext(PlayersContext);
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
      {players.map((player) => (
        <ListItem key={player.id}>
          <ListItemText>
            {player.name + " 🧠".repeat(player.score)}
          </ListItemText>
        </ListItem>
      ))}
    </List>
  );
};
