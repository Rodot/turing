import React, { useEffect } from "react";
import { ChatHistory } from "./chatHistory";
import { ChatInput } from "./chatInput";
import { Box, Chip, Container, Paper, Typography } from "@mui/material";
import { ChatVote } from "./chatVotes";
import { ButtonLeaveGame } from "./buttonLeaveGame";
import { ButtonCreateGame } from "./buttonCreateGame";
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
        height: "100dvh",
        display: "flex",
        flexDirection: "column",
        p: 0,
      }}
    >
      <Paper
        sx={{
          display: "flex",
          flexDirection: "row",
          flexWrap: "wrap",
          alignContent: "center",
          justifyContent: "center",
          p: 1,
          gap: 1,
          borderRadius: 0,
          zIndex: 2,
          position: "sticky",
          top: 0,
        }}
      >
        {players
          .sort((a, b) => b.score - a.score)
          .map((player) => (
            <Chip
              key={player.id}
              label={player.name + " " + "🧠".repeat(player.score)}
            />
          ))}
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
        sx={{ borderRadius: 0, zIndex: 2, postition: "sticky", bottom: 0 }}
      >
        {isTalking && <ChatInput />}
        {isVoting && <ChatVote />}
        {isOver && (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 1,
              my: 2,
            }}
          >
            {isHost && <ButtonCreateGame />}
            {!isHost && (
              <Typography>
                Waiting for {host?.name} to start the game
              </Typography>
            )}
            {<ButtonLeaveGame />}
          </Box>
        )}
      </Paper>
    </Container>
  );
};
