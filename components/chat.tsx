import React, { useContext } from "react";
import { ChatHistory } from "./chatHistory";
import { ChatInput } from "./chatInput";
import { Container } from "@mui/material";
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
    !player?.is_dead && !gameOver && room?.data?.status === "playing";
  const canVote =
    !player?.is_dead && !gameOver && room?.data?.status === "voting";

  return (
    <Container
      sx={{
        maxWidth: "sm",
        display: "flex",
        flexDirection: "column",
        gap: 2,
        p: 2,
      }}
    >
      <ChatHistory />
      {canTalk && <ChatInput />}
      {canVote && <ChatVote />}
      {gameOver && <ButtonLeaveGame sx={{ mt: 4 }} />}
    </Container>
  );
};
