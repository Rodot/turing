import { GptResponse } from "../_types/Gpt.type.ts";

export const fetchChatCompletionJson = async (
  messages: Array<{ role: string; content: string }>,
) => {
  const gptResponse = await fetch(
    "https://api.openai.com/v1/chat/completions",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${Deno.env.get("OPENAI_API_KEY")}`,
      },
      body: JSON.stringify({
        model: "o4-mini",
        response_format: { type: "json_object" },
        reasoning: { effort: "low" },
        temperature: 1.5,
        messages,
      }),
    },
  );

  if (!gptResponse.ok) {
    const errorText = await gptResponse.text();
    throw new Error("Error response from OpenAI:" + errorText);
  }

  const gptAnswerRaw = ((await gptResponse.json()) as GptResponse).choices[0]
    .message.content;

  const gptAnswer = JSON.parse(gptAnswerRaw);
  return gptAnswer;
};
