"use client";

import React from "react";
import { User } from "@supabase/supabase-js";
import { Box, Typography } from "@mui/material";
import { MessageData } from "@/supabase/functions/_types/Database.type";

export function ChatMessage({
  message,
  user,
}: {
  message: MessageData;
  user: User;
}) {
  const is_me = message.user_id === user.id;
  return (
    <Box
      display="flex"
      flexDirection={is_me ? "row-reverse" : "row"}
      alignItems="center"
    >
      <Box
        bgcolor={is_me ? "primary.main" : "background.default"}
        color={is_me ? "primary.contrastText" : "text.primary"}
        borderRadius={4}
        p={1}
        m={1}
        maxWidth="80%"
      >
        {!is_me && (
          <Typography variant="caption" color="primary.main">
            {message.author}
          </Typography>
        )}
        <Typography>{message.content}</Typography>
      </Box>
    </Box>
  );
}
