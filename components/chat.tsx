import React, { useContext } from "react";
import { ChatHistory } from "./chatHistory";
import { ChatInput } from "./chatInput";
import { Box, Container, Paper, Toolbar, Typography } from "@mui/material";
import {
  PlayersContext,
  RoomContext,
  RoomProfilesContext,
  UserContext,
} from "./contextProvider";
import { ChatVote } from "./chatVotes";
import { ButtonLeaveGame } from "./buttonLeaveGame";
import { ButtonCreateGame } from "./buttonCreateGame";
import { ButtonJoinGame } from "./buttonJoinGame";

export const Chat: React.FC = () => {
  const user = useContext(UserContext);
  const room = useContext(RoomContext);
  const players = useContext(PlayersContext);
  const roomProfiles = useContext(RoomProfilesContext);

  const player = players?.find((player) => player.user_id === user?.id);
  const gameOver = room?.data?.status === "over";
  const canTalk =
    !player?.is_dead && !gameOver && room?.data?.status === "talking";
  const nextRoomId = room?.data?.next_room_id;
  const isHost = roomProfiles?.[0]?.id === user?.id;
  const showVotes = room?.data?.status === "voting";

  return (
    <Container
      sx={{
        maxWidth: "sm",
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
        {canTalk && <ChatInput />}
        {showVotes && <ChatVote />}
        {gameOver && (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 1,
              my: 2,
            }}
          >
            {isHost && !nextRoomId && <ButtonCreateGame />}
            {!isHost && !nextRoomId && (
              <Typography>Waiting for host to start next game...</Typography>
            )}
            {(!isHost || nextRoomId) && <ButtonJoinGame roomId={nextRoomId} />}
            {<ButtonLeaveGame />}
          </Box>
        )}
      </Paper>
    </Container>
  );
};
