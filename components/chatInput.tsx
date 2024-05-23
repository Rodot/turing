import React, { useContext, useState } from "react";
import { supabase } from "@/utils/supabase/client";
import {
  MessagesContext,
  PlayersContext,
  RoomContext,
  UserContext,
} from "./contextProvider";
import { playerName } from "@/utils/user";
import {
  Box,
  Button,
  Chip,
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
} from "@/supabase/functions/_shared/chat";
import { Spinner } from "./spinner";
import { Send } from "@mui/icons-material";

type Props = {
  sx?: SxProps<Theme>;
};

export const ChatInput: React.FC<Props> = ({ sx }) => {
  const [loadingGeneration, setGenerationLoading] = useState(false);
  const [loadingSend, setLoadingSend] = useState(false);
  const [content, setContent] = useState("");
  const [botAnswers, setBotAnswers] = useState<string[] | undefined>();
  const user = useContext(UserContext);
  const room = useContext(RoomContext);
  const players = useContext(PlayersContext);
  const messages = useContext(MessagesContext);

  if (!user) return null;
  const roomId = room?.data?.id;
  if (!roomId) return null;
  const me = players.find((player) => player.user_id === user?.id);
  if (!me) return null;

  const talkingPlayers = getPlayersWithLeastMessages(players, messages);
  const canTalk = talkingPlayers?.some((p) => p.id === me.id);

  const generateAnswers = async () => {
    try {
      setGenerationLoading(true);
      let receivedAnswers: string[] = [];
      let timeout = 3;
      while (!receivedAnswers?.length) {
        if (!timeout--) throw new Error("Answer generation timed out");
        const req: any = await generateAnswersFunction(
          supabase,
          roomId,
          me.name
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
    try {
      setLoadingSend(true);
      await postMessageFunction(supabase, {
        room_id: roomId,
        user_id: user.id,
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
    <Box sx={{ ...sx, display: "flex", flexDirection: "column" }}>
      <VoteCountdown />
      <Typography textAlign="center" sx={{ my: 1 }}>
        {canTalk && (
          <>
            Your turn to talk as{" "}
            <strong>{me.is_bot ? "🤖 Possesed" : "🧑 Human"}</strong>
          </>
        )}{" "}
        {!canTalk && talkingPlayers?.length && (
          <>
            Waiting for{" "}
            {talkingPlayers.length > 2
              ? "others"
              : talkingPlayers.map((p) => p.name).join(", ")}
            ...
          </>
        )}
      </Typography>
      {/* bot input */}
      {canTalk && me.is_bot && !botAnswers && (
        <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
          <Button
            variant="contained"
            color="secondary"
            sx={{ flexShrink: 1, flexGrow: 0 }}
            onClick={generateAnswers}
            disabled={loadingGeneration}
          >
            Generate answers
            {loadingGeneration && <Spinner />}
          </Button>
        </Box>
      )}
      {canTalk && me.is_bot && botAnswers && (
        <>
          {botAnswers.map((answer) => (
            <Box
              key={answer}
              sx={{ display: "flex", flexDirection: "row", m: 1 }}
            >
              <Typography sx={{ p: 1, textAlign: "center", flexGrow: 1 }}>
                {answer.toLowerCase()}
              </Typography>
              <Button
                variant="contained"
                color="secondary"
                key="answer"
                onClick={() => sendMessageFromBot(answer)}
                disabled={loadingSend}
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
        <form onSubmit={handleSubmit} style={{ width: "100%" }}>
          <Box
            sx={{
              display: "flex",
              alignContent: "center",
              justifyContent: "center",
              p: 1,
            }}
          >
            <TextField
              type="text"
              autoComplete="off"
              value={content}
              onChange={handleInputChange}
              sx={{ flexGrow: 1, mr: 1 }}
              label={"Talk as " + playerName(user?.id, players)}
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
  );
};
