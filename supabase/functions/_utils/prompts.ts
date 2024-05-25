import { MessageData } from "../_types/Database.type.ts";
import { removeEmojis } from "../_shared/utils.ts";

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
