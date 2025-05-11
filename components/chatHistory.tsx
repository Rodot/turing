import React, { useContext, useRef, useEffect } from "react";
import { MessagesContext } from "./contextProvider";
import { List } from "@mui/material";
import { ChatMessage } from "./chatMessage";
import { useUserQuery } from "@/hooks/useUserQuery";

export const ChatHistory: React.FC = () => {
  const userQuery = useUserQuery();
  const messages = useContext(MessagesContext);
  const endOfMessagesRef = useRef<null | HTMLDivElement>(null);

  const scrollToBottom = () => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  if (!userQuery.data) return null;

  const userData = userQuery.data;

  return (
    <List>
      {messages.map((message) => (
        <ChatMessage key={message.id} message={message} user={userData} />
      ))}
      <div ref={endOfMessagesRef} />
    </List>
  );
};
