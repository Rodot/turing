import React, { useContext } from "react";
import { ChatHistory } from "./chatHistory";
import { ChatInput } from "./chatInput";
import { Button, Container } from "@mui/material";
import { PlayersContext, RoomContext, UserContext } from "./contextProvider";
import { supabase } from "@/utils/supabase/client";
import { generateMessageFunction } from "@/queries/functions/functions.query";
import { ChatVote } from "./chatVotes";
import { ButtonLeaveGame } from "./buttonLeaveGame";

export const Chat: React.FC = () => {
  const user = useContext(UserContext);
  const room = useContext(RoomContext);
  const players = useContext(PlayersContext);
  const me = players?.find((player) => player.user_id === user?.id);
  const gameOver = room?.data?.status === "over";

  const callEdgeFunction = async () => {
    if (!room?.data?.id) return;
    generateMessageFunction(supabase, room.data.id);
  };

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
      {!me?.is_dead && !gameOver && (
        <>
          <ChatInput />
          <ChatVote />
        </>
      )}
      {gameOver && <ButtonLeaveGame sx={{ mt: 4 }} />}
      <Button sx={{ mt: 8 }} variant="contained" onClick={callEdgeFunction}>
        +
      </Button>
    </Container>
  );
};
