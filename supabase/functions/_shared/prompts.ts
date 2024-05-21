import { SupabaseClient } from "https://esm.sh/v135/@supabase/supabase-js@2.43.2/dist/module/index.js";
import { MessageData, PlayerData } from "../_types/Database.type.ts";
import { insertMessage } from "../_queries/messages.query.ts";
import { fetchChatCompletionJson } from "../_queries/gpt.query.ts";

const messagesToPrompt = (
  speakerName: string,
  messages: Array<MessageData>
) => {
  let prompt = "";
  messages.forEach((message) => {
    const you = message.author === speakerName ? " (you)" : "";
    prompt += `${message.author}${you}: ${message.content}\n`;
  });
  return prompt;
};

export const promptForNextMessage = (
  speakerName: string,
  messagesData: MessageData[]
) => {
  const systemPrompt = `You are not an AI. You are ${speakerName}, a 14 years old filthy teenager. You will be provided a group chat history. It's an informal group conversation on whatsapp. You usually speak in short answers, a single sentence at a time, use slangs, and do a least one grammar mistake in your message. You don't use emojis. You often randomly change topics. You don't always answer what your are asked if you don't want to, or if you don't know, as you're a 14 years old teenager. ${speakerName}, what will be your next message ? Only include a single message as a JSON object in the shape of {author:"${speakerName}, message:string}.`;

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

export const generateMessage = async (
  supabase: SupabaseClient,
  roomId: string,
  player: PlayerData,
  messages: MessageData[]
) => {
  const prompt = promptForNextMessage(player.name, messages);

  const gptAnswer = await fetchChatCompletionJson(prompt);
  console.log(`Generated message`, gptAnswer);

  // delay to simulate typing
  const messageLength = gptAnswer.message.length;
  const wordsPerMinute = Math.floor(Math.random() * 40 + 20);
  const charactersPerWord = 5;
  const charactersPerSecond = (wordsPerMinute * charactersPerWord) / 60;
  const delay = messageLength / charactersPerSecond;
  await new Promise((resolve) => setTimeout(resolve, delay * 1000));

  await insertMessage(supabase, {
    author: player.name,
    player_id: player.id,
    room_id: roomId,
    content: gptAnswer.message.toLowerCase(),
  });
};
