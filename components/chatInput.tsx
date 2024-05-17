import React, { useContext, useState } from "react";
import { supabase } from "@/utils/supabase/client";
import { UserContext } from "./contextProvider";
import { formatUser } from "@/utils/user";

const ChatInput: React.FC = () => {
  const [content, setContent] = useState("");
  const user = useContext(UserContext);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setContent(event.target.value);
  };

  const sendMessage = async () => {
    if (content.trim() !== "") {
      const author = formatUser(user);
      const { data, error } = await supabase
        .from("messages")
        .insert([{ content, author }]);
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
    <div>
      <form onSubmit={handleSubmit}>
        <input type="text" value={content} onChange={handleInputChange} />
        <button type="submit">Send</button>
      </form>
    </div>
  );
};

export default ChatInput;
