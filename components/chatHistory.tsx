"use client";

import React, { useContext } from "react";
import { MessagesContext, UserContext } from "./contextProvider";
import { List } from "@mui/material";
import { ChatMessage } from "./chatMessage";

export const ChatHistory: React.FC = () => {
  const messages = useContext(MessagesContext);
  const user = useContext(UserContext);
  if (!user) return null;

  return (
    <List>
      {messages.map((message) => (
        <ChatMessage key={message.id} message={message} user={user} />
      ))}
    </List>
  );
};
