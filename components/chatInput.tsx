import React, { useContext, useState } from "react";
import { supabase } from "@/utils/supabase/client";
import { PlayersContext, RoomContext, UserContext } from "./contextProvider";
import { playerName } from "@/utils/user";
import {
  Box,
  Button,
  LinearProgress,
  SxProps,
  TextField,
  Theme,
  Typography,
} from "@mui/material";
import { postMessageFunction } from "@/queries/functions/functions.query";

type Props = {
  sx?: SxProps<Theme>;
};

export const ChatInput: React.FC<Props> = ({ sx }) => {
  const [content, setContent] = useState("");
  const user = useContext(UserContext);
  const room = useContext(RoomContext);
  const players = useContext(PlayersContext);

  const player = players.find((player) => player.user_id === user?.id);
  const talkingPLayer = players.find(
    (player) => player.id === room?.data?.next_player_id
  );
  const canTalk = room?.data?.next_player_id === player?.id;

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setContent(event.target.value);
  };

  const sendMessage = async () => {
    if (content.trim() !== "") {
      postMessageFunction(supabase, {
        room_id: room?.data?.id,
        user_id: user?.id,
        player_id: player?.id,
        author: player?.name,
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
      {!canTalk && <LinearProgress />}
      <Typography textAlign="center" sx={{ mt: 1 }}>
        {canTalk
          ? "Your turn!"
          : `${talkingPLayer?.name} is typing, wait for your turn...`}
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
