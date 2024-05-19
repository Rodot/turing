// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
/// <reference types="https://esm.sh/@supabase/functions-js/src/edge-runtime.d.ts" />

import { Message } from "../_shared/Database.type.ts";
import { GptResponse } from "../_shared/Gpt.type.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js";

const systemPrompt = `You will be provided by a chat history as a list JSON format. Your job is to create the next message in the chat. It's an informal group conversation between friends, reply as such. That means short answers, informal text, slangs, some typos and emojis. DO NOT reply as a helpful ai. Only include a single message as a JSON object without the list, so it can be appended to the existing list.`;

const messagesToPrompt = (messages: Array<Message>) =>
  messages.map((message) => ({
    participant: message.author,
    message: message.content,
  }));

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { roomId } = await req.json();
    if (!roomId) {
      throw new Error("Missing roomId");
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: req.headers.get("Authorization")! },
        },
      }
    );

    const messagesResponse = await supabase
      .from("messages")
      .select("*")
      .eq("room_id", roomId);
    if (messagesResponse.error) {
      throw new Error(
        "Error fetching messages: " + messagesResponse.error.message
      );
    }
    console.log(messagesResponse.data);

    const messages = [
      {
        role: "system",
        content: systemPrompt,
      },
      {
        role: "user",
        content: JSON.stringify(messagesToPrompt(messagesResponse.data)),
      },
    ];

    console.log("Prompt:");
    console.log(messages);

    const gptResponse = await fetch(
      "https://api.openai.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${Deno.env.get("OPENAI_API_KEY")}`,
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          response_format: { type: "json_object" },
          messages,
          temperature: 0.7,
        }),
      }
    );

    console.log(gptResponse);
    if (!gptResponse.ok) {
      const errorText = await gptResponse.text();
      console.error("Error response from OpenAI:", errorText);
    }

    const gptAnswerRaw = ((await gptResponse.json()) as GptResponse).choices[0]
      .message.content;
    const gptAnswer = JSON.parse(gptAnswerRaw);

    console.log(gptAnswer);

    const insertMessageResponse = await supabase.from("messages").insert([
      {
        author: gptAnswer.participant,
        room_id: roomId,
        content: gptAnswer.message,
      },
    ]);

    console.log(insertMessageResponse);

    const data = {};

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/generate-message' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"roomId":"01ec474f-4966-47bc-85ba-e6b6e6d2fc06"}'

*/
