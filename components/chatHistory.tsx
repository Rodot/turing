import React, { useContext, useRef, useEffect } from "react";
import { MessagesContext, RoomContext, UserContext } from "./contextProvider";
import { List, SxProps, Theme } from "@mui/material";
import { ChatMessage } from "./chatMessage";

type Props = {
  sx?: SxProps<Theme>;
};

export const ChatHistory: React.FC<Props> = ({ sx }) => {
  const user = useContext(UserContext);
  const messages = useContext(MessagesContext);
  const room = useContext(RoomContext);
  const endOfMessagesRef = useRef<null | HTMLDivElement>(null);

  const scrollToBottom = () => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, room?.data?.status]);

  if (!user) return null;

  return (
    <List sx={sx}>
      {messages.map((message) => (
        <ChatMessage key={message.id} message={message} user={user} />
      ))}
      <div ref={endOfMessagesRef} />
    </List>
  );
};
