import { SupabaseClient } from "https://esm.sh/v135/@supabase/supabase-js@2.43.2/dist/module/index.js";
import { MessageData, PlayerData } from "../_types/Database.type.ts";
import { insertMessage } from "../_queries/messages.query.ts";
import { fetchChatCompletionJson } from "../_queries/gpt.query.ts";

const removeEmojis = (text: string) => {
  return text.replace(
    /([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g,
    ""
  );
};

const messagesToPrompt = (
  speakerName: string,
  messages: Array<MessageData>
) => {
  let prompt = "";
  messages.forEach((message) => {
    const you = message.author === speakerName ? "(you)" : "";
    const author = removeEmojis(message.author);
    prompt += `${author}${you}: ${message.content}\n`;
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
  let gptAnswer: string | undefined;
  let timeout = 3;
  const start = Date.now();
  while (!gptAnswer?.length && timeout--) {
    const prompt = promptForNextMessage(removeEmojis(player.name), messages);
    gptAnswer = await fetchChatCompletionJson(prompt);
    console.log(`Generated message`, gptAnswer);
  }
  const end = Date.now();
  const generationDelayMs = end - start;

  if (!gptAnswer) throw new Error("Failed to generate message");

  // delay to simulate typing
  const messageLength = gptAnswer.length;
  const wordsPerMinute = Math.floor(Math.random() * 40 + 20);
  const charactersPerWord = 5;
  const charactersPerSecond = (wordsPerMinute * charactersPerWord) / 60;
  const typingDelayMs = (1000 * messageLength) / charactersPerSecond;

  const delayMs = Math.max(0, typingDelayMs - generationDelayMs);
  console.log(`Delaying for ${Math.floor(delayMs / 1000)}s`);
  // if (delayMs > 1000) {
  //   await new Promise((resolve) => setTimeout(resolve, delayMs));
  // }

  await insertMessage(supabase, {
    author: player.name,
    player_id: player.id,
    room_id: roomId,
    content: gptAnswer.toLowerCase(),
  });
};
