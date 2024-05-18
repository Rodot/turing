"use client";
import { GroupContext, UserContext } from "@/components/contextProvider";
import { useContext } from "react";
import ChatInput from "@/components/chatInput";
import { ChatHistory } from "@/components/chatHistory";
import { Container, Button } from "@mui/material";
import { supabase } from "@/utils/supabase/client";

export default function Index() {
  const user = useContext(UserContext);
  const group = useContext(GroupContext);

  const callEdgeFunction = async () =>
    supabase.functions.invoke("generate-message", {
      body: { groupId: group?.id },
    });

  if (!group?.id) return <div>Group not found</div>;

  return (
    <>
      <Container maxWidth="sm">
        <ChatHistory />
        <ChatInput />
        <Button variant="contained" onClick={callEdgeFunction}>
          +
        </Button>
      </Container>
    </>
  );
}
