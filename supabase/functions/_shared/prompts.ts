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

const cleanAnswer = (str: string) => {
  str = str.trim();
  str = str.toLowerCase();
  if (str.startsWith("'") && str.endsWith("'")) {
    return str.slice(1, -1);
  }
  if (str.startsWith('"') && str.endsWith('"')) {
    return str.slice(1, -1);
  }
  if (str.startsWith("`") && str.endsWith("`")) {
    return str.slice(1, -1);
  }
  if (str.startsWith("...")) {
    return str.slice(3);
  }
  if (str.endsWith("...")) {
    return str.slice(0, -3);
  }
  return str;
};

const messagesToPrompt = (
  speakerName: string,
  messages: Array<MessageData>
) => {
  let prompt = "";
  messages.forEach((message) => {
    if (message.author === "system") return;
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
  const systemPrompt = `You are not an AI. You are ${speakerName}, a 14 years old teenager. You will be provided an informal group conversation on whatsapp. You usually speak in short answers, a single sentence at a time, use slangs, and do a least one grammar mistake in your message. You don't use emojis. You don't use ponctuation. You have a lot of imagination and like to discuss random thoughts. You like to change topics every few messages. If you are bored or uneasy, you'll talk about a random, unrelated thought.  You will restate your name, then your next message (a single sentence). ${speakerName}, answer as a JSON object using the following keys: {myName:"...", yourNextMessage:"..."}`;

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
  messages: MessageData[],
  delayedResponse: boolean
) => {
  const prompt = promptForNextMessage(removeEmojis(player.name), messages);
  let gptAnswer: string | undefined;

  const start = Date.now();
  let timeout = 3;
  while (!gptAnswer?.length && timeout--) {
    gptAnswer = await fetchChatCompletionJson(prompt);
    gptAnswer = cleanAnswer(gptAnswer ?? "");
  }
  const end = Date.now();
  const generationDelayMs = end - start;

  if (!gptAnswer?.length) gptAnswer = "...";

  // delay to simulate typing
  const messageLength = gptAnswer.length;
  const wordsPerMinute = Math.floor(Math.random() * 40 + 20);
  const charactersPerWord = 5;
  const charactersPerSecond = (wordsPerMinute * charactersPerWord) / 60;
  const typingDelayMs = (1000 * messageLength) / charactersPerSecond;

  const delayMs = Math.max(0, typingDelayMs - generationDelayMs);
  console.log(`Delaying for ${Math.floor(delayMs / 1000)}s`);
  if (delayedResponse && delayMs > 1000) {
    await new Promise((resolve) => setTimeout(resolve, delayMs));
  }

  await insertMessage(supabase, {
    author: player.name,
    user_id: player.user_id ?? undefined,
    player_id: player.id,
    room_id: roomId,
    content: gptAnswer,
  });
};
