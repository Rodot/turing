import React, { useContext } from "react";
import { ChatHistory } from "./chatHistory";
import { ChatInput } from "./chatInput";
import { Button, Container } from "@mui/material";
import { PlayersContext, RoomContext, UserContext } from "./contextProvider";
import { supabase } from "@/utils/supabase/client";
import { generateMessageFunction } from "@/queries/functions/functions.query";
import { ChatVote } from "./chatVotes";

export const Chat: React.FC = () => {
  const user = useContext(UserContext);
  const room = useContext(RoomContext);
  const players = useContext(PlayersContext);
  const me = players?.find((player) => player.user_id === user?.id);

  const callEdgeFunction = async () => {
    if (!room?.data?.id) return;
    generateMessageFunction(supabase, room.data.id);
  };

  return (
    <Container maxWidth="sm">
      <ChatHistory />
      {!me?.is_dead && (
        <>
          <ChatInput />
          <ChatVote />
        </>
      )}
      <Button variant="contained" onClick={callEdgeFunction}>
        +
      </Button>
    </Container>
  );
};
