import React, { useContext } from "react";
import { ChatHistory } from "./chatHistory";
import { ChatInput } from "./chatInput";
import { Button, Container } from "@mui/material";
import { RoomContext } from "./contextProvider";
import { supabase } from "@/utils/supabase/client";

export const Chat: React.FC = () => {
  const room = useContext(RoomContext);

  const callEdgeFunction = async () => {
    if (!room?.data?.id) return;
    supabase.functions.invoke("generate-message", {
      body: { roomId: room?.data?.id },
    });
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
