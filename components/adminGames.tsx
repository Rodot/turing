"use client";

import React from "react";
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Chip,
} from "@mui/material";
import { PlayerList } from "./playerList";
import { useAllGamesQuery } from "@/hooks/useAllGamesQuery";
import { GameData } from "@/supabase/functions/_types/Database.type";
import { useRouter } from "next/navigation";

export const AdminGames: React.FC = () => {
  const { data: games } = useAllGamesQuery();
  const router = useRouter();

  const handleGameClick = (gameId: string) => {
    router.push(`/spectate?game=${gameId}`);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Games ({games?.length || 0})
      </Typography>

      <Box sx={{ mt: 3 }}>
        {games?.map((game: GameData) => (
          <Card
            key={game.id}
            sx={{
              mb: 2,
              cursor: "pointer",
              "&:hover": {
                backgroundColor: "action.hover",
              },
            }}
            onClick={() => handleGameClick(game.id)}
          >
            <CardContent>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 2,
                }}
              >
                <Typography variant="body2" color="text.secondary">
                  {new Date(game.created_at).toLocaleString()}
                </Typography>
                <Box sx={{ display: "flex", gap: 1 }}>
                  <Chip label={game.status} size="small" />
                  <Chip label={game.lang} size="small" />
                </Box>
              </Box>

              <PlayerList players={game.players} />
            </CardContent>
          </Card>
        ))}
      </Box>
    </Container>
  );
};
