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
  SxProps,
  TextField,
  Theme,
  Typography,
} from "@mui/material";
import { postMessageFunction } from "@/queries/functions/functions.query";
import { VoteCountdown } from "./voteCountdown";
import { getPlayersWithLeastMessages } from "@/supabase/functions/_shared/chat";
import { Spinner } from "./spinner";

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

  const me = players.find((player) => player.user_id === user?.id);

  const talkingPlayers = getPlayersWithLeastMessages(players, messages);
  const canTalk = talkingPlayers?.some((p) => p.id === me?.id);

  const generateAnswers = async () => {
    try {
      setGenerationLoading(true);
      setBotAnswers(["Beep", "Boop"]);
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
        room_id: room?.data?.id,
        user_id: user?.id,
        player_id: me?.id,
        author: me?.name,
        content: text.toLowerCase(),
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
    <Box sx={{ ...sx, display: "flex", flexDirection: "column", gap: 1 }}>
      <VoteCountdown />
      <Typography textAlign="center" sx={{ my: 1 }}>
        {canTalk && (
          <>
            Your turn to talk as{" "}
            <strong>{me?.is_bot ? "🤖 Possesed" : "🧑 Human"}</strong>
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
      {canTalk && me?.is_bot && !botAnswers && (
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
      )}
      {canTalk && me?.is_bot && botAnswers && (
        <>
          {botAnswers.map((answer) => (
            <Button
              variant="contained"
              color="secondary"
              key="answer"
              onClick={() => sendMessageFromBot(answer)}
              disabled={loadingSend}
            >
              &quot;{answer}&quot;
              {loadingSend && <Spinner />}
            </Button>
          ))}
        </>
      )}

      {/* human input */}
      {!me?.is_bot && (
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
              Send
              {loadingSend && <Spinner />}
            </Button>
          </Box>
        </form>
      )}
    </Box>
  );
};
