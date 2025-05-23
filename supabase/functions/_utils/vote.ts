import { SupabaseClient } from "https://esm.sh/v135/@supabase/supabase-js@2.43.2/dist/module/index.js";
import { PlayerData } from "../_types/Database.type.ts";
import {
  updateAllPlayersInGame,
  updatePlayerInGame,
} from "../_queries/game.query.ts";

export const setRandomPlayerAsBotAndResetVotes = async (
  supabase: SupabaseClient,
  gameId: string,
  players: PlayerData[],
) => {
  if (!players?.length) throw new Error("No players to pick from");

  // reset bots and votes for all players
  await updateAllPlayersInGame(supabase, gameId, {
    vote: null,
    vote_blank: false,
    is_bot: false,
  });

  // chance to add no bot if there was a bot before
  const previousBot = players.find((player) => player.is_bot);
  const noBotThisRound = Math.random() <= 1 / (players.length + 1);
  if (previousBot && noBotThisRound) return;

  // set random player as bot
  const previousHumans = players.filter((player) => !player.is_bot);
  const randomPlayer =
    previousHumans[Math.floor(Math.random() * previousHumans.length)];
  await updatePlayerInGame(supabase, gameId, randomPlayer.id, {
    is_bot: true,
  });
};
