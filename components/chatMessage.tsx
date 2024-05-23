"use client";

import React from "react";
import { User } from "@supabase/supabase-js";
import { Box, Typography } from "@mui/material";
import { MessageData } from "@/supabase/functions/_types/Database.type";
import { isSystem } from "@/supabase/functions/_shared/chat";

export function ChatMessage({
  message,
  user,
}: {
  message: MessageData;
  user: User;
}) {
  const isMe = message.user_id === user.id;
  const fromSystem = isSystem(message);

  const getBgColor = () => {
    if (isMe) return "primary.main";
    if (fromSystem) return "white";
    return "background.default";
  };

  const getColor = () => {
    if (isMe) return "primary.contrastText";
    if (fromSystem) return "primary.main";
    return "text.primary";
  };

  const getJustify = () => {
    if (isMe) return "end";
    if (fromSystem) return "center";
    return "start";
  };

  const getTextAlign = () => {
    if (isMe) return "right";
    if (fromSystem) return "center";
    return "left";
  };

  return (
    <Box display="flex" justifyContent={getJustify()}>
      <Box
        bgcolor={getBgColor()}
        color={getColor()}
        borderRadius={4}
        p={fromSystem ? 4 : 1}
        m={1}
        maxWidth={fromSystem ? "100%" : "80%"}
      >
        {!fromSystem && (
          <Typography variant="caption" color={isMe ? "lightgrey" : "grey"}>
            {message.author}
          </Typography>
        )}
        <Typography sx={{ textAlign: getTextAlign() }}>
          {message.content}
        </Typography>
      </Box>
    </Box>
  );
}
