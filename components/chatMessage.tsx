"use client";

import React from "react";
import { User } from "@supabase/supabase-js";
import { Box, Typography } from "@mui/material";
import { MessageData } from "@/supabase/functions/_types/Database.type";
import { isSystem } from "@/supabase/functions/_shared/utils";

export function ChatMessage({
  message,
  user,
}: {
  message: MessageData;
  user: User;
}) {
  const isMe = message.profile_id === user.id;
  const fromSystem = isSystem(message);

  const getBgColor = () => {
    if (isMe) return "primary.main";
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
        p={1}
        m={1}
        maxWidth={fromSystem ? "100%" : "80%"}
      >
        {!fromSystem && (
          <Typography variant="caption" color={isMe ? "lightgrey" : "grey"}>
            {message.author}
          </Typography>
        )}
        <Typography
          sx={{
            textAlign: getTextAlign(),
            wordWrap: "break-word",
            overflowWrap: "break-word",
          }}
        >
          {message.content}
        </Typography>
      </Box>
    </Box>
  );
}
