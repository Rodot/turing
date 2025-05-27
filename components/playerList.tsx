"use client";

import React from "react";
import { Box, Chip } from "@mui/material";
import { PlayerData } from "@/supabase/functions/_types/Database.type";
import { motion } from "framer-motion";

interface PlayerListProps {
  players: PlayerData[];
}

export const PlayerList: React.FC<PlayerListProps> = ({ players }) => {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "row",
        overflowX: "auto",
        justifyContent: "fex-start",
        maxWidth: "100%",
        gap: 1,
      }}
    >
      {players
        .sort((a: PlayerData, b: PlayerData) => b.score - a.score)
        .map((player: PlayerData) => (
          <motion.div
            key={player.id}
            layoutId={player.id}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <motion.div
              key={player.score}
              initial={{ scale: player.score > 0 ? 1.5 : 1 }}
              animate={{ scale: 1 }}
              transition={{ duration: 1.0 }}
            >
              <Box>
                <Chip
                  size="small"
                  label={
                    player.score === 0
                      ? player.name
                      : player.name + " " + player.score + " 🧠"
                  }
                />
              </Box>
            </motion.div>
          </motion.div>
        ))}
    </Box>
  );
};
