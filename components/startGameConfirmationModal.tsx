"use client";

import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
} from "@mui/material";
import { PlayerData } from "@/supabase/functions/_types/Database.type";
import { PlayerList } from "./playerList";
import { useTranslation } from "react-i18next";

interface StartGameConfirmationModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  players: PlayerData[];
  isLoading?: boolean;
}

export const StartGameConfirmationModal: React.FC<
  StartGameConfirmationModalProps
> = ({ open, onClose, onConfirm, players, isLoading = false }) => {
  const { t } = useTranslation();

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{t("lobby.startGameConfirmation.question")}</DialogTitle>
      <DialogContent>
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
          <PlayerList players={players} />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isLoading}>
          {t("lobby.startGameConfirmation.cancel")}
        </Button>
        <Button
          onClick={onConfirm}
          variant="contained"
          color="secondary"
          disabled={isLoading}
        >
          {t("lobby.startGameConfirmation.confirm")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
