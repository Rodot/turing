"use client";

import React, { useContext } from "react";
import { MessagesContext } from "./contextProvider";

export const ChatHistory: React.FC = () => {
  const messages = useContext(MessagesContext);

  return (
    <div>
      <ul>
        {messages.map((message, id) => (
          <li key={id}>
            {message.author} : {message.content}
          </li>
        ))}
      </ul>
    </div>
  );
};
