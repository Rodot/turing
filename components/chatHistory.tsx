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
    () =>
      (messagesQuery.data || []).filter((message) => message.type !== "status"),
    [messagesQuery.data],
  );
  const gameQuery = useGameQuery();
  const endOfMessagesRef = useRef<null | HTMLDivElement>(null);

  const scrollToBottom = () => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    const timeoutId = setTimeout(scrollToBottom, 300);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [messages, gameQuery?.data]);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        scrollToBottom();
      }, 300);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

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
