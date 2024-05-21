import React, { useContext } from "react";
import { ChatHistory } from "./chatHistory";
import { ChatInput } from "./chatInput";
import { Container, Paper, Toolbar } from "@mui/material";
import { PlayersContext, RoomContext, UserContext } from "./contextProvider";
import { ChatVote } from "./chatVotes";
import { ButtonLeaveGame } from "./buttonLeaveGame";

export const Chat: React.FC = () => {
  const user = useContext(UserContext);
  const room = useContext(RoomContext);
  const players = useContext(PlayersContext);

  const player = players?.find((player) => player.user_id === user?.id);
  const gameOver = room?.data?.status === "over";
  const canTalk =
    !player?.is_dead && !gameOver && room?.data?.status === "talking";
  const showVotes = gameOver || room?.data?.status === "voting";

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
        {gameOver && <ButtonLeaveGame />}
      </Paper>
    </Container>
  );
};
