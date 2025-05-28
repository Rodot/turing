import React, { useState } from "react";
import { Box, Button, SxProps, TextField, Theme } from "@mui/material";
import { usePostMessageMutation } from "@/hooks/useFunctionsMutation";
import { cleanAnswer } from "@/supabase/functions/_shared/utils";
import { Send } from "@mui/icons-material";
import { useUserQuery } from "@/hooks/useUserQuery";
import { useGameQuery } from "@/hooks/useGameQuery";
import { getPlayerFromGame } from "@/supabase/functions/_shared/utils";
import { useTranslation } from "react-i18next";
import { Spinner } from "./spinner";

type Props = {
  sx?: SxProps<Theme>;
};

export const ChatInput: React.FC<Props> = ({ sx }) => {
  const { t } = useTranslation();
  const [content, setContent] = useState("");
  const userQuery = useUserQuery();
  const gameQuery = useGameQuery();
  const postMessageMutation = usePostMessageMutation();

  if (!userQuery.data) {
    return null;
  }
  const gameId = gameQuery?.data?.id;
  if (!gameId || !gameQuery.data) {
    return null;
  }
  const me = getPlayerFromGame(gameQuery.data, userQuery.data.id);
  if (!me) {
    console.error("Player not found for user", userQuery.data?.id);
    return null;
  }

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setContent(event.target.value);
  };

  const sendMessage = async (text: string) => {
    if (!userQuery.data?.id) {
      console.error("User ID not available");
      return;
    }

    await postMessageMutation.mutateAsync({
      game_id: gameId,
      profile_id: me.id,
      author_name: me.name,
      type: "user",
      content: cleanAnswer(text),
    });
  };

  const sendMessageFromInput = async () => {
    if (content.trim() !== "") {
      await sendMessage(content);
      setContent("");
    }
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    sendMessageFromInput();
  };

  return (
    <>
      <Box
        sx={{
          ...sx,
          display: "flex",
          flexDirection: "column",
          width: "100%",
        }}
      >
        {/* bot input */}
        {me.is_bot && (
          <form onSubmit={handleSubmit}>
            <Box
              sx={{
                display: "flex",
                alignContent: "center",
                justifyContent: "center",
              }}
            >
              <TextField
                type="text"
                autoComplete="off"
                value={content}
                onChange={handleInputChange}
                label={t("forms.botWordInput")}
                inputProps={{ maxLength: 10 }}
                sx={{ flexGrow: 1, mr: 1 }}
                aria-label="Bot word input"
              />

              <Button
                type="submit"
                variant="contained"
                color="secondary"
                disabled={
                  postMessageMutation.isPending || content.trim().length === 0
                }
                aria-label="Send word"
              >
                <Send />
                {postMessageMutation.isPending && <Spinner />}
              </Button>
            </Box>
          </form>
        )}

        {/* human input */}
        {!me.is_bot && (
          <form onSubmit={handleSubmit}>
            <Box
              sx={{
                display: "flex",
                alignContent: "center",
                justifyContent: "center",
              }}
            >
              <TextField
                type="text"
                autoComplete="off"
                value={content}
                onChange={handleInputChange}
                label={t("buttons.sendMessage")}
                sx={{ flexGrow: 1, mr: 1 }}
                aria-label="Message input"
              />

              <Button
                type="submit"
                variant="contained"
                color="secondary"
                disabled={postMessageMutation.isPending}
                aria-label="Send message button"
              >
                <Send />
                {postMessageMutation.isPending && <Spinner />}
              </Button>
            </Box>
          </form>
        )}
      </Box>
    </>
  );
};
