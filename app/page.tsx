"use client";
import { GroupContext, UserContext } from "@/components/contextProvider";
import { useContext } from "react";
import { formatUser, shortenId } from "@/utils/user";
import ChatInput from "@/components/chatInput";
import { ChatHistory } from "@/components/chatHistory";
import { Container, AppBar, Toolbar, Typography, Button } from "@mui/material";
import { supabase } from "@/utils/supabase/client";

export default function Index() {
  const user = useContext(UserContext);
  const group = useContext(GroupContext);

  const callEdgeFunction = async () =>
    supabase.functions.invoke("generate-message", {
      body: { groupId: group?.id },
    });

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6">
            Welcome {formatUser(user)} ! In group :{" "}
            {group?.usersId.map((user) => shortenId(user)).join(", ")}
          </Typography>
          <Button
            variant="contained"
            onClick={callEdgeFunction}
            disabled={!group?.id}
          >
            +
          </Button>
        </Toolbar>
      </AppBar>
      <Container maxWidth="sm">
        <ChatHistory />
        <ChatInput />
      </Container>
    </>
  );
}
