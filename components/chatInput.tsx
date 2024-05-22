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

type Props = {
  sx?: SxProps<Theme>;
};

export const ChatInput: React.FC<Props> = ({ sx }) => {
  const [content, setContent] = useState("");
  const user = useContext(UserContext);
  const room = useContext(RoomContext);
  const players = useContext(PlayersContext);
  const messages = useContext(MessagesContext);

  const me = players.find((player) => player.user_id === user?.id);

  const talkingPlayers = getPlayersWithLeastMessages(players, messages);
  const canTalk = talkingPlayers?.some((p) => p.id === me?.id);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setContent(event.target.value);
  };

  const sendMessage = async () => {
    if (content.trim() !== "") {
      postMessageFunction(supabase, {
        room_id: room?.data?.id,
        user_id: user?.id,
        player_id: me?.id,
        author: me?.name,
        content: content.toLowerCase(),
      });
      setContent("");
    }
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    sendMessage();
  };

  return (
    <Box sx={{ ...sx, display: "flex", flexDirection: "column" }}>
      <VoteCountdown />
      <Typography textAlign="center" sx={{ mt: 1 }}>
        {canTalk && <strong>Your turn to talk</strong>}
        {!canTalk && talkingPlayers?.length && (
          <>Wait for {talkingPlayers.map((p) => p.name).join(", ")}...</>
        )}
      </Typography>
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
            disabled={!canTalk}
          >
            Send
          </Button>
        </Box>
      </form>
    </Box>
  );
};
