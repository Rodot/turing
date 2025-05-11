import React, { useContext, useState } from "react";
import { supabase } from "@/utils/supabase/client";
import { MessagesContext, PlayersContext } from "./contextProvider";
import {
  Box,
  Button,
  SxProps,
  TextField,
  Theme,
  Typography,
} from "@mui/material";
import {
  generateAnswersFunction,
  postMessageFunction,
} from "@/queries/functions/functions.query";
import { VoteCountdown } from "./voteCountdown";
import {
  cleanAnswer,
  getPlayersWithLeastMessages,
} from "@/supabase/functions/_shared/utils";
import { Spinner } from "./spinner";
import { Send } from "@mui/icons-material";
import { useUserQuery } from "@/hooks/useUserQuery";
import { useRoomQuery } from "@/hooks/useRoomQuery";

type Props = {
  sx?: SxProps<Theme>;
};

export const ChatInput: React.FC<Props> = ({ sx }) => {
  const [loadingGeneration, setGenerationLoading] = useState(false);
  const [loadingSend, setLoadingSend] = useState(false);
  const [content, setContent] = useState("");
  const [botAnswers, setBotAnswers] = useState<string[] | undefined>();
  const userQuery = useUserQuery();
  const roomQuery = useRoomQuery();
  const players = useContext(PlayersContext);
  const messages = useContext(MessagesContext);
  if (!userQuery.data) return null;
  const roomId = roomQuery?.data?.id;
  if (!roomId) return null;
  const me = players.find((player) => player.user_id === userQuery.data?.id);
  if (!me) return null;

  const talkingPlayers = getPlayersWithLeastMessages(players, messages);
  const canTalk = talkingPlayers?.some((p) => p.id === me.id);
  const isLate = canTalk && talkingPlayers.length <= 2;

  const generateAnswers = async () => {
    try {
      setGenerationLoading(true);
      let receivedAnswers: string[] = [];
      let timeout = 3;
      while (!receivedAnswers?.length) {
        if (!timeout--) throw new Error("Answer generation timed out");
        const req = await generateAnswersFunction(
          supabase,
          roomId,
          me.name,
          roomQuery?.data?.lang ?? "en",
        );
        console.log(req);
        receivedAnswers = (req?.possibleNextMessages ?? []).map(cleanAnswer);
      }
      setBotAnswers(receivedAnswers);
    } catch (error) {
      console.error(error);
    } finally {
      setGenerationLoading(false);
    }
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setContent(event.target.value);
  };

  const sendMessage = async (text: string) => {
    if (!userQuery.data?.id) {
      console.error("User ID not available");
      return;
    }

    try {
      setLoadingSend(true);
      await postMessageFunction(supabase, {
        room_id: roomId,
        user_id: userQuery.data.id,
        player_id: me.id,
        author: me.name,
        content: cleanAnswer(text),
      });
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingSend(false);
    }
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
      <VoteCountdown />
      <Box
        sx={{ ...sx, display: "flex", flexDirection: "column", gap: 1, p: 1 }}
      >
        {isLate && (
          <Typography textAlign="center">
            <strong>⏰ Hurry up!</strong>
          </Typography>
        )}
        {!canTalk && talkingPlayers?.length && (
          <Typography textAlign="center">
            Waiting for{" "}
            {talkingPlayers.length > 2
              ? "others"
              : talkingPlayers.map((p) => p.name).join(", ")}
          </Typography>
        )}
        {/* bot input */}
        {me.is_bot && !botAnswers && (
          <Box sx={{ display: "flex", justifyContent: "center" }}>
            <Button
              variant="contained"
              color="secondary"
              sx={{ flexShrink: 1, flexGrow: 0 }}
              onClick={generateAnswers}
              disabled={loadingGeneration || !canTalk}
            >
              Generate 🤖 AI Answers
              {loadingGeneration && <Spinner />}
            </Button>
          </Box>
        )}
        {me.is_bot && botAnswers && (
          <>
            {botAnswers.map((answer) => (
              <Box key={answer} sx={{ display: "flex", flexDirection: "row" }}>
                <Typography sx={{ textAlign: "center", flexGrow: 1, mr: 1 }}>
                  {answer.toLowerCase()}
                </Typography>
                <Button
                  variant="contained"
                  color="secondary"
                  key="answer"
                  onClick={() => sendMessageFromBot(answer)}
                  disabled={loadingSend || !canTalk}
                >
                  <Send />
                  {loadingSend && <Spinner />}
                </Button>
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
                label={`Send a message as ${me.name}`}
                sx={{ flexGrow: 1, mr: 1 }}
              />
              <Button
                type="submit"
                variant="contained"
                color="secondary"
                disabled={!canTalk || loadingSend}
              >
                <Send />
                {loadingSend && <Spinner />}
              </Button>
            </Box>
          </form>
        )}
      </Box>
    </>
  );
};
