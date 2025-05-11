import React, { useContext, useEffect } from "react";
import { ChatHistory } from "./chatHistory";
import { ChatInput } from "./chatInput";
import {
  Box,
  Chip,
  Container,
  LinearProgress,
  Paper,
  Toolbar,
  Typography,
} from "@mui/material";
import {
  MessagesContext,
  PlayersContext,
  RoomProfilesContext,
} from "./contextProvider";
import { ChatVote } from "./chatVotes";
import { ButtonLeaveGame } from "./buttonLeaveGame";
import { ButtonCreateGame } from "./buttonCreateGame";
import { useUserQuery } from "@/hooks/useUserQuery";
import { useJoinRoomMutation, useRoomQuery } from "@/hooks/useRoomQuery";

export const Chat: React.FC = () => {
  const userQuery = useUserQuery();
  const roomQuery = useRoomQuery();
  const messages = useContext(MessagesContext);
  const roomProfiles = useContext(RoomProfilesContext);
  const players = useContext(PlayersContext);
  const joinRoomMutation = useJoinRoomMutation();

  const host = roomProfiles?.[0];
  const isHost = roomProfiles?.[0]?.id === userQuery.data?.id;
  const isWarmup = roomQuery?.data?.status === "warmup";
  const isTalking = roomQuery?.data?.status === "talking";
  const isVoting = roomQuery?.data?.status === "voting";
  const isOver = roomQuery?.data?.status === "over";

  useEffect(() => {
    const nextRoomId = roomQuery?.data?.next_room_id;
    if (nextRoomId) {
      joinRoomMutation.mutate(nextRoomId);
    }
  }, [joinRoomMutation, roomQuery]);

  return (
    <Container
      sx={{
        maxWidth: "720px!important",
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        p: 0,
      }}
    >
      <Toolbar /> {/* empty toolbar to avoid covering page content */}
      <Paper
        sx={{
          display: "flex",
          flexDirection: "row",
          alignContent: "center",
          justifyContent: "center",
          p: 1,
          gap: 1,
          borderRadius: 0,
          zIndex: 2,
          flexWrap: "wrap",
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
          flexGrow: 1,
          overflowY: "auto",
          overflowX: "hidden",
        }}
      >
        <ChatHistory />
      </Box>
      <Paper elevation={8} sx={{ borderRadius: 0, zIndex: 2 }}>
        {isWarmup && (
          <Box>
            <LinearProgress
              variant="determinate"
              color="secondary"
              value={(100 * messages.length) / 10}
            />
            <Typography sx={{ textAlign: "center", p: 1 }}>
              Warming up...
            </Typography>
          </Box>
        )}
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
