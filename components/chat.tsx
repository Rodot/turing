import React, { useEffect } from "react";
import { ChatHistory } from "./chatHistory";
import { ChatInput } from "./chatInput";
import { Box, Chip, Container, Paper, Typography } from "@mui/material";
import { ChatVote } from "./chatVotes";
import { ButtonCreateGame } from "./buttonCreateGame";
import { ButtonGoHome } from "./buttonGoHome";
import { useUserQuery } from "@/hooks/useUserQuery";
import { useJoinGameMutation, useGameQuery } from "@/hooks/useGameQuery";
import { useProfilesQuery } from "@/hooks/useProfilesQuery";
import { usePlayersQuery } from "@/hooks/usePlayersQuery";

export const Chat: React.FC = () => {
  const userQuery = useUserQuery();
  const gameQuery = useGameQuery();
  const profilesQuery = useProfilesQuery();
  const playersQuery = usePlayersQuery();
  const gameProfiles = profilesQuery.data || [];
  const players = playersQuery.data || [];
  const joinGameMutation = useJoinGameMutation();

  const host = gameProfiles?.[0];
  const isHost = gameProfiles?.[0]?.id === userQuery.data?.id;
  const isTalking = gameQuery?.data?.status === "talking";
  const isVoting = gameQuery?.data?.status === "voting";
  const isOver = gameQuery?.data?.status === "over";

  useEffect(() => {
    const nextGameId = gameQuery?.data?.next_game_id;
    if (nextGameId) {
      joinGameMutation.mutate(nextGameId);
    }
  }, [joinGameMutation, gameQuery]);

  return (
    <Container
      sx={{
        maxWidth: "720px!important",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        p: 0,
      }}
    >
      <Paper
        sx={{
          display: "flex",
          flexDirection: "row",
          alignContent: "center",
          position: "sticky",
          top: 0,
          zIndex: 2,
          p: 0,
          pl: 2,
          borderRadius: 0,
        }}
      >
        <ButtonGoHome />
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            alignContent: "center",
            overflowX: "auto",
            gap: 1,
          }}
        >
          {players
            .sort((a, b) => b.score - a.score)
            .map((player) => (
              <Box
                key={player.id}
                sx={{
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <Chip
                  size="small"
                  label={player.name + " " + player.score + " 🧠"}
                />
              </Box>
            ))}
        </Box>
      </Paper>

      <Box
        sx={{
          overflowY: "auto",
          overflowX: "hidden",
          flexGrow: 1,
        }}
      >
        <ChatHistory />
      </Box>

      <Paper
        elevation={8}
        sx={{
          borderRadius: 0,
          zIndex: 2,
          position: "sticky",
          bottom: 0,
        }}
      >
        {isTalking && <ChatInput />}
        {isVoting && <ChatVote />}
      </Paper>
    </Container>
  );
};
