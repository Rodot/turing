"use client";
import { UserContext } from "@/components/contextProvider";
import { useContext } from "react";
import { formatUser } from "@/utils/user";
import ChatInput from "@/components/chatInput";
import { ChatHistory } from "@/components/chatHistory";
import {
  Container,
  AppBar,
  Toolbar,
  Typography,
  Box,
  Paper,
} from "@mui/material";

export default function Index() {
  const user = useContext(UserContext);

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6">Welcome {formatUser(user)}</Typography>
        </Toolbar>
      </AppBar>
      <Container maxWidth="sm">
        <ChatHistory />
        <ChatInput />
      </Container>
    </>
  );
}
