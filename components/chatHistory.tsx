import React, { useRef, useEffect, useMemo } from "react";
import { List } from "@mui/material";
import { ChatMessage } from "./chatMessage";
import { useUserQuery } from "@/hooks/useUserQuery";
import { useMessagesQuery } from "@/hooks/useMessagesQuery";
import { useGameQuery } from "@/hooks/useGameQuery";

export const ChatHistory: React.FC = () => {
  const userQuery = useUserQuery();
  const messagesQuery = useMessagesQuery();
  const messages = useMemo(
    () => messagesQuery.data || [],
    [messagesQuery.data],
  );
  const gameQuery = useGameQuery();
  const endOfMessagesRef = useRef<null | HTMLDivElement>(null);

  const scrollToBottom = () => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    setTimeout(scrollToBottom, 100);
  }, [messages, gameQuery?.data]);

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
