import React, { useState } from "react";
import {
  Box,
  Button,
  IconButton,
  SxProps,
  TextField,
  Theme,
  Typography,
} from "@mui/material";
import {
  useGenerateAnswersMutation,
  usePostMessageMutation,
} from "@/hooks/useFunctionsMutation";
import { cleanAnswer } from "@/supabase/functions/_shared/utils";
import { Send } from "@mui/icons-material";
import { useUserQuery } from "@/hooks/useUserQuery";
import { useGameQuery } from "@/hooks/useGameQuery";
import { Spinner } from "./spinner";
import { getPlayerFromGame } from "@/supabase/functions/_shared/utils";

type Props = {
  sx?: SxProps<Theme>;
};

export const ChatInput: React.FC<Props> = ({ sx }) => {
  const [content, setContent] = useState("");
  const [botAnswers, setBotAnswers] = useState<string[] | undefined>();
  const userQuery = useUserQuery();
  const gameQuery = useGameQuery();
  const generateAnswersMutation = useGenerateAnswersMutation();
  const postMessageMutation = usePostMessageMutation();

  if (!userQuery.data) {
    console.error("User data not available");
    return null;
  }
  const gameId = gameQuery?.data?.id;
  if (!gameId || !gameQuery.data) {
    console.error("Game ID not available");
    return null;
  }
  const me = getPlayerFromGame(gameQuery.data, userQuery.data.id);
  if (!me) {
    console.error("Player not found for user", userQuery.data?.id);
    return null;
  }

  const generateAnswers = async () => {
    let receivedAnswers: string[] = [];
    let timeout = 3;
    while (!receivedAnswers?.length) {
      if (!timeout--) throw new Error("Answer generation timed out");
      const req = await generateAnswersMutation.mutateAsync({
        gameId,
        playerName: me.name,
        lang: gameQuery?.data?.lang ?? "en",
      });
      console.log(req);
      receivedAnswers = (req?.possibleNextMessages ?? []).map(cleanAnswer);
    }
    setBotAnswers(receivedAnswers);
  };

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

  const sendMessageFromBot = async (text: string) => {
    await sendMessage(text);
    setBotAnswers(undefined);
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
        {me.is_bot && !botAnswers && (
          <Box sx={{ display: "flex", justifyContent: "center" }}>
            <Button
              variant="contained"
              color="secondary"
              sx={{ flexShrink: 1, flexGrow: 0 }}
              onClick={generateAnswers}
              disabled={generateAnswersMutation.isPending}
              aria-label="AI Answers"
            >
              Generate AI Answers 🤖
              {generateAnswersMutation.isPending && <Spinner />}
            </Button>
          </Box>
        )}
        {me.is_bot && botAnswers && (
          <>
            {botAnswers.map((answer) => (
              <Box
                key={answer}
                sx={{
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                }}
              >
                <Typography
                  variant="body2"
                  sx={{ textAlign: "center", flexGrow: 1, mr: 1 }}
                >
                  {answer.toLowerCase()}
                </Typography>
                <IconButton
                  color="secondary"
                  key="answer"
                  size="small"
                  onClick={() => sendMessageFromBot(answer)}
                  disabled={postMessageMutation.isPending}
                  aria-label="Send message"
                >
                  <Send />
                </IconButton>
              </Box>
            ))}
          </>
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
                label="Send message"
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
              </Button>
            </Box>
          </form>
        )}
      </Box>
    </>
  );
};
