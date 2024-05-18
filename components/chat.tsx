import React, { useContext } from "react";
import { ChatHistory } from "./chatHistory";
import { ChatInput } from "./chatInput";
import { Button, Container } from "@mui/material";
import { GroupContext, UserContext } from "./contextProvider";
import { supabase } from "@/utils/supabase/client";

export const Chat: React.FC = () => {
  const group = useContext(GroupContext);

  const callEdgeFunction = async () => {
    if (!group?.id) return;
    supabase.functions.invoke("generate-message", {
      body: { groupId: group?.id },
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
