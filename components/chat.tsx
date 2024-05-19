import React, { useContext } from "react";
import { ChatHistory } from "./chatHistory";
import { ChatInput } from "./chatInput";
import { Button, Container } from "@mui/material";
import { RoomContext } from "./contextProvider";
import { supabase } from "@/utils/supabase/client";
import { generateMessageFunction } from "@/queries/functions/functions.query";

export const Chat: React.FC = () => {
  const room = useContext(RoomContext);

  const callEdgeFunction = async () => {
    if (!room?.data?.id) return;
    generateMessageFunction(supabase, room.data.id);
  };

  return (
    <Container maxWidth="sm">
      <ChatHistory />
      <ChatInput />
      <Button variant="contained" onClick={callEdgeFunction}>
        +
      </Button>
    </Container>
  );
};
