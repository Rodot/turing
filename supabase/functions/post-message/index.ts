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
import { checkWarmupTransition } from "../_utils/check-warmup-transition.ts";
import { getTranslationFunction } from "../_shared/i18n.ts";

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
      await checkAndTransitionToHunt(supabase, game);
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
) => {
  // Re-fetch all messages to ensure we have the latest data
  const messages = await fetchMessages(supabase, game.id);
  if (!messages) throw new Error("No messages found after re-fetch");

  const shouldTransition = checkWarmupTransition(game, messages);

  if (shouldTransition) {
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

    // Get translation function based on game language
    const t = getTranslationFunction(game.lang);

    await postSystemMessage(
      supabase,
      game.id,
      `🤖 ${t("messages.aiTookControl")}`,
    );
  }
};
