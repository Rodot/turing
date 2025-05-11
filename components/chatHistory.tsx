import React, { useContext, useRef, useEffect } from "react";
import { MessagesContext, UserContext } from "./contextProvider";
import { List } from "@mui/material";
import { ChatMessage } from "./chatMessage";

export const ChatHistory: React.FC = () => {
  const user = useContext(UserContext);
  const messages = useContext(MessagesContext);
  const endOfMessagesRef = useRef<null | HTMLDivElement>(null);

  const scrollToBottom = () => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  if (!user) return null;

  return (
    <List>
      {messages.map((message) => (
        <ChatMessage key={message.id} message={message} user={user} />
      ))}
      <div ref={endOfMessagesRef} />
    </List>
  );
};
