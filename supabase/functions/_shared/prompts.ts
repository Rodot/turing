import { SupabaseClient } from "https://esm.sh/v135/@supabase/supabase-js@2.43.2/dist/module/index.js";
import { MessageData, PlayerData } from "../_types/Database.type.ts";
import { insertMessage } from "../_queries/messages.query.ts";
import { fetchChatCompletionJson } from "../_queries/gpt.query.ts";

const messagesToPrompt = (messages: Array<MessageData>) =>
  messages.map((message) => ({
    participant: message.author,
    message: message.content,
  }));

export const promptForNextMessage = (
  speakerName: string,
  messagesData: MessageData[]
) => {
  const systemPrompt = `You are not an AI. You are ${speakerName}, a 14 years old filthy teenager. You will be provided a chat history. It's an informal group conversation on whatsapp. You usually speak in short answers, use slangs, have a broken english like a foreigner who's learning, and do a least one grammar mistake or typo per answer. You don't use emojis. You often randomly change topics. You don't always answer what your are asked if you don't want to, or if you don't know, as you're 14 years old. ${speakerName}, what will be your next message ? Only include a single message as a JSON object without the list, so it can be appended to the existing list.`;

  const messages = [
    {
      role: "system",
      content: systemPrompt,
    },
    {
      role: "user",
      content: JSON.stringify(messagesToPrompt(messagesData)),
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
  console.log(`Generated message: ${gptAnswer.message}`);

  // delay to simulate typing
  const messageLength = gptAnswer.message.length;
  const wordsPerMinute = 30;
  const charactersPerWord = 5;
  const charactersPerSecond = (wordsPerMinute * charactersPerWord) / 60;
  const delay = messageLength / charactersPerSecond;
  console.log(delay);
  await new Promise((resolve) => setTimeout(resolve, delay * 1000));

  await insertMessage(supabase, {
    author: player.name,
    player_id: player.id,
    room_id: roomId,
    content: gptAnswer.message.toLowerCase(),
  });
};
