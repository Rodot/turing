// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
/// <reference types="https://esm.sh/@supabase/functions-js/src/edge-runtime.d.ts" />

import {
  fetchMessages,
  insertMessage,
  postSystemMessage,
} from "../_queries/messages.query.ts";
import { headers } from "../_utils/cors.ts";
import { createSupabaseClient } from "../_utils/supabase.ts";
import { createErrorResponse } from "../_utils/error.ts";
import { GameData, MessageData } from "../_types/Database.type.ts";
import {
  fetchGameAndCheckStatus,
  updateGame,
  updateGameWithStatusTransition,
  updatePlayerInGame,
} from "../_queries/game.query.ts";
import { pickRandom } from "../_shared/utils.ts";
import { SupabaseClient } from "https://esm.sh/v135/@supabase/supabase-js@2.43.2/dist/module/index.js";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers });
  }

  try {
    const message = (await req.json()) as Partial<MessageData>;

    if (!message?.game_id) throw new Error("Game ID is required");
    if (!message?.profile_id) throw new Error("Profile ID is required");
    if (!message?.content) throw new Error("Content is required");
    if (!message?.author_name) throw new Error("Author name is required");

    const supabase = createSupabaseClient(req);

    const [messages, game] = await Promise.all([
      fetchMessages(supabase, message?.game_id),
      fetchGameAndCheckStatus(supabase, message?.game_id, [
        "talking_warmup",
        "talking_hunt",
      ]),
    ]);

    if (!messages) throw new Error("No messages found");

    await insertMessage(supabase, message);

    // Check if we need to transition from talking_warmup to talking_hunt
    if (game.status === "talking_warmup") {
      console.log(
        `Checking if we can transition to talking_hunt for game ${game.id}`,
      );
      await checkAndTransitionToHunt(supabase, game, messages, message);
    }

    const data = JSON.stringify({});
    return new Response(data, { headers, status: 200 });
  } catch (error) {
    return createErrorResponse(error);
  }
});

const checkAndTransitionToHunt = async (
  supabase: SupabaseClient,
  game: GameData,
  messages: MessageData[],
  newMessage: Partial<MessageData>,
) => {
  // Find the last status message indicating talking_warmup started
  const lastWarmupStatusIndex = messages.findLastIndex(
    (m) => m.type === "status" && m.content === "talking_warmup",
  );

  if (lastWarmupStatusIndex === -1) {
    // No warmup status message found, can't determine when warmup started
    return;
  }

  // Get all messages since warmup started
  const messagesSinceWarmup = messages.slice(lastWarmupStatusIndex + 1);

  // Add the new message we just posted to the list
  const allMessagesSinceWarmup = [...messagesSinceWarmup, newMessage];

  // Get only user messages since warmup (including the new one)
  const userMessagesSinceWarmup = allMessagesSinceWarmup.filter(
    (m) => m.type === "user",
  );

  // Count messages per player
  const messageCountsByPlayer = new Map<string, number>();

  for (const player of game.players) {
    const playerMessages = userMessagesSinceWarmup.filter(
      (m) => m.profile_id === player.id,
    );
    messageCountsByPlayer.set(player.id, playerMessages.length);
  }

  console.log(
    `Message counts since warmup for game ${game.id}:`,
    Array.from(messageCountsByPlayer.entries()).map(([id, count]) => ({
      id,
      count,
    })),
  );

  // Check if all players have at least 2 messages
  const allPlayersReady = game.players.every(
    (player) => (messageCountsByPlayer.get(player.id) || 0) >= 2,
  );

  if (allPlayersReady) {
    // Transition to talking_hunt
    await updateGameWithStatusTransition(supabase, game.id, "talking_hunt");

    // Select a random player to be the bot

    // chance to add no bot if there was a bot before
    const previousBot = game.players.find((player) => player.is_bot);
    const noBotThisRound = Math.random() <= 1 / (game.players.length + 1);

    // Filter out the last bot to avoid consecutive selection
    const availablePlayers = game.players.filter(
      (player) => player.id !== game.last_bot_id,
    );

    const botPlayer =
      previousBot && noBotThisRound ? undefined : pickRandom(availablePlayers);

    if (botPlayer) {
      await updatePlayerInGame(supabase, game.id, botPlayer.id, {
        is_bot: true,
      });

      // Update the game's last_bot_id to track this selection
      await updateGame(supabase, game.id, { last_bot_id: botPlayer.id });
    }

    await postSystemMessage(
      supabase,
      game.id,
      `🤖 The AI took control of someone, find who!`,
    );
  }
};
