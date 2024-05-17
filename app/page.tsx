"use client";
import { GroupContext, UserContext } from "@/components/contextProvider";
import { useContext } from "react";
import { formatUser, shortenId } from "@/utils/user";
import ChatInput from "@/components/chatInput";
import { ChatHistory } from "@/components/chatHistory";
import { Container, AppBar, Toolbar, Typography } from "@mui/material";

export default function Index() {
  const user = useContext(UserContext);
  const group = useContext(GroupContext);

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6">
            Welcome {formatUser(user)} ! In group :{" "}
            {group?.usersId.map((user) => shortenId(user)).join(", ")}
          </Typography>
        </Toolbar>
      </AppBar>
      <Container maxWidth="sm">
        <ChatHistory />
        <ChatInput />
      </Container>
    </>
  );
}
