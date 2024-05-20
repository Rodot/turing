import React, { useContext, useState } from "react";
import { supabase } from "@/utils/supabase/client";
import { PlayersContext, RoomContext, UserContext } from "./contextProvider";
import { playerName } from "@/utils/user";
import { Box, Button, TextField } from "@mui/material";
import { postMessageFunction } from "@/queries/functions/functions.query";

export const ChatInput: React.FC = () => {
  const [content, setContent] = useState("");
  const user = useContext(UserContext);
  const room = useContext(RoomContext);
  const players = useContext(PlayersContext);
  const player = players.find((player) => player.user_id === user?.id);

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
        <Button type="submit" variant="contained" color="secondary">
          Send
        </Button>
      </Box>
    </form>
  );
};
