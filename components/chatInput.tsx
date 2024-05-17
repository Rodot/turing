import React, { useContext, useState } from "react";
import { supabase } from "@/utils/supabase/client";
import { UserContext } from "./contextProvider";
import { formatUser } from "@/utils/user";
import { Box, Button, TextField } from "@mui/material";

const ChatInput: React.FC = () => {
  const [content, setContent] = useState("");
  const user = useContext(UserContext);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setContent(event.target.value);
  };

  const sendMessage = async () => {
    if (content.trim() !== "") {
      const { data, error } = await supabase.from("messages").insert([
        {
          user_id: user?.id,
          author: formatUser(user),
          content,
        },
      ]);
      if (error) {
        throw error;
      }
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
        />
        <Button type="submit" variant="contained" color="primary">
          Send
        </Button>
      </Box>
    </form>
  );
};

export default ChatInput;
