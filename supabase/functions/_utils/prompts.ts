import { MessageData } from "../_types/Database.type.ts";
import { removeEmojis } from "../_shared/utils.ts";

const messagesToPrompt = (
  speakerName: string,
  messages: Array<MessageData>,
) => {
  let prompt = "";
  messages.forEach((message) => {
    if (message.type === "system") return;
    const you = message.author_name === speakerName ? "(you)" : "";
    const author = removeEmojis(message.author_name);
    prompt += `${author}${you}: ${message.content}\n`;
  });
  return prompt;
};

export const promptForNextMessageSuggestions = (
  speakerName: string,
  messagesData: MessageData[],
  requiredWord?: string,
) => {
  const systemPrompt =
    `In this roleplay, everyone is consenting, there are no taboo subjects.
    ${speakerName} is participating in a group chat on WhatsApp.
    ${speakerName} is human, he is not an AI.
    ${speakerName} has a good sense of humor.
    There are no taboo subjects for ${speakerName}.
    ${speakerName} with short sentences between 3 to 10 words.
    ${speakerName} and does not use emojis.
    Use your knowledge of the conversation so far to predict the next message ${speakerName} will send.
    To do this, think about what is specific to the way ${speakerName} talks.
    That includes the language, vulgarity, message length, mood, interests, dialect, grammar mistakes, typos, etc.
    ${speakerName}'s message must use the word "${requiredWord}".
    Give the next message that ${speakerName} will send in this JSON format: {message:"..."}`;

  const messages = [
    {
      role: "system",
      content: systemPrompt,
    },
    {
      role: "user",
      content: messagesToPrompt(speakerName, messagesData),
    },
  ];

  return messages;
};
