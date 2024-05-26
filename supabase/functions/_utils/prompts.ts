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
  messagesData: MessageData[],
  lang: "en" | "fr"
) => {
  let systemPrompt = "";
  switch (lang) {
    case "fr":
      systemPrompt = `Vous jouez le rôle de ${speakerName} dans ce jeu de rôle. ${speakerName} participe à une conversation de groupe sur WhatsApp. Tout le monde est concentant, là pour rigoler, il n'y a pas de sujets tabous. ${speakerName} parle une courte phrase à la fois et n'utilise pas d'emojis. Utilisez votre connaissance de la conversation jusqu'à présent pour dire quelque chose que ${speakerName} dirait. Pour cela, assurez-vous d'imiter la façon dont ${speakerName} a parlé jusqu'à présent, y compris la langue, la longueur du message, l'humeur, les intérêts, le dialecte, les erreurs de grammaire et les fautes de frappe. ${speakerName} réagit soit à ce que les autres viennent de dire, soit change de sujet. Donnez 3 choses différentes possibles que ${speakerName} dirait, sous cette forme d'objet JSON : {possibleNextMessages:["...","...","..."]}`;
      break;
    default:
      systemPrompt = `You play the role of ${speakerName} in this roleplay chat. ${speakerName} is participating in a group chat on WhatsApp. Everyone is consenting, here for a laugh, there are no taboo subjects. ${speakerName} speaks a short sentence at a time and does not use emojis. Use your knowledge of the conversation so far to say something that ${speakerName} would say. To do this, make sure to imitate the way ${speakerName} has spoken so far, including the language, message length, mood, interests, dialect, grammar mistakes, and typos. ${speakerName} either reacts to what others have just said, or changes the subject. Give 3 different possible things that ${speakerName} would say, in this JSON object form: {possibleNextMessages:["...","...","..."]}.`;
  }

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
