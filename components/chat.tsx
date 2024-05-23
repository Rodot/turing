import React, { useContext, useEffect } from "react";
import { ChatHistory } from "./chatHistory";
import { ChatInput } from "./chatInput";
import {
  Box,
  Container,
  LinearProgress,
  Paper,
  Toolbar,
  Typography,
} from "@mui/material";
import {
  MessagesContext,
  RoomContext,
  RoomProfilesContext,
  UserContext,
} from "./contextProvider";
import { ChatVote } from "./chatVotes";
import { ButtonLeaveGame } from "./buttonLeaveGame";
import { ButtonCreateGame } from "./buttonCreateGame";

export const Chat: React.FC = () => {
  const user = useContext(UserContext);
  const room = useContext(RoomContext);
  const messages = useContext(MessagesContext);
  const roomProfiles = useContext(RoomProfilesContext);

  const nextRoomId = room?.data?.next_room_id;
  const host = roomProfiles?.[0];
  const isHost = roomProfiles?.[0]?.id === user?.id;
  const isWarmup = room?.data?.status === "warmup";
  const isTalking = room?.data?.status === "talking";
  const isVoting = room?.data?.status === "voting";
  const isOver = room?.data?.status === "over";

  useEffect(() => {
    if (nextRoomId) {
      room.joinRoom(nextRoomId);
    }
  }, [room, nextRoomId]);

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
      <ChatHistory
        sx={{
          flexGrow: 1,
          overflowY: "auto",
          overflowX: "hidden",
        }}
      />
      <Paper elevation={8} sx={{ borderRadius: 0 }}>
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
                Waiting for {host?.name} to start next game...
              </Typography>
            )}
            {<ButtonLeaveGame />}
          </Box>
        )}
      </Paper>
    </Container>
  );
};
