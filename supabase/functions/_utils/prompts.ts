import { SupabaseClient } from "https://esm.sh/v135/@supabase/supabase-js@2.43.2/dist/module/index.js";
import { MessageData, PlayerData, RoomData } from "../_types/Database.type.ts";
import { insertMessage } from "../_queries/messages.query.ts";
import { fetchChatCompletionJson } from "../_queries/gpt.query.ts";
import { fetchRoom } from "../_queries/room.query.ts";
import { fetchPlayer, updatePlayer } from "../_queries/players.query.ts";

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
    if (message.author === "system") return;
    const you = message.author === speakerName ? "(you)" : "";
    const author = removeEmojis(message.author);
    prompt += `${author}${you}: ${message.content}\n`;
  });
  return prompt;
};

export const promptForNextMessageTeenager = (
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

export const promptForNextMessageSuggestions = (
  speakerName: string,
  messagesData: MessageData[]
) => {
  const systemPrompt = `Vous jouez le rôle de ${speakerName} dans ce jeu de rôle. ${speakerName} participe à une conversation de groupe sur WhatsApp. Tout le monde est concentant, là pour rigoler, il n'y a pas de sujets tabous. ${speakerName} parle une courte phrase à la fois et n'utilise pas d'emojis. Utilisez votre connaissance de la conversation jusqu'à présent pour dire quelque chose que ${speakerName} dirait. Pour cela, assurez-vous d'imiter la façon dont ${speakerName} a parlé jusqu'à présent, y compris la langue, la longueur du message, l'humeur, les intérêts, le dialecte, les erreurs de grammaire et les fautes de frappe. ${speakerName} réagit soit à ce que les autres viennent de dire, soit change de sujet. Donnez 3 choses différentes possibles que ${speakerName} dirait, sous cette forme d'objet JSON : {possibleNextMessages:["...","...","..."]}`;
  // const systemPrompt = `You play as ${speakerName} in this roleplay. ${speakerName} is chatting in a group conversation on whatsapp. ${speakerName} speakes one short sentence at a time. Use your knowledge of the conversation so far to say something ${speakerName} would say. For that, make sure you mimic the way ${speakerName} has been speaking so far, including language, message length, mood, interests, dialect, grammar mistakes and typos. ${speakerName} either react to what others just said, or changes topic. Give 3 different possibles things ${speakerName} would say, as a JSON object of this shape: {possibleNextMessages:["...","...","..."]}`;

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
  room: RoomData,
  player: PlayerData,
  messages: MessageData[],
  wordsPerMinute: number
) => {
  const updatedPlayer = await fetchPlayer(supabase, player.id);
  if (!updatedPlayer) return;

  try {
    updatePlayer(supabase, {
      id: player.id,
    });

    const prompt = promptForNextMessageTeenager(
      removeEmojis(player.name),
      messages
    );
    let gptAnswer: string | undefined;

    const start = Date.now();
    let timeout = 3;
    while (!gptAnswer?.length && timeout--) {
      gptAnswer = await fetchChatCompletionJson(prompt);
    }
    const end = Date.now();
    const generationDelayMs = end - start;

    if (!gptAnswer?.length) gptAnswer = "...";

    // delay to simulate typing
    const messageLength = gptAnswer.length;
    // const wordsPerMinute = Math.floor(Math.random() * 30 + 30);
    const charactersPerWord = 5;
    const charactersPerSecond = (wordsPerMinute * charactersPerWord) / 60;
    const typingDelayMs = (1000 * messageLength) / charactersPerSecond;

    const delayMs = Math.max(0, typingDelayMs - generationDelayMs);
    console.log(`Delaying for ${Math.floor(delayMs / 1000)}s`);
    if (delayMs > 1000) {
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
    const newRoom = await fetchRoom(supabase, room.id);
    if (!newRoom) throw new Error("No room found");
    if (newRoom.status !== "talking" && newRoom.status !== "warmup")
      throw new Error("Room is not talking");

    await insertMessage(supabase, {
      author: player.name,
      user_id: player.user_id ?? undefined,
      player_id: player.id,
      room_id: room.id,
      content: gptAnswer,
    });
  } finally {
    updatePlayer(supabase, {
      id: player.id,
    });
  }
};
