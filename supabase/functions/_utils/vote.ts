import { SupabaseClient } from "https://esm.sh/v135/@supabase/supabase-js@2.43.2/dist/module/index.js";
import { PlayerData } from "../_types/Database.type.ts";
import { updateGamePlayers, updatePlayer } from "../_queries/players.query.ts";

export const setRandomPlayerAsBotAndResetVotes = async (
  supabase: SupabaseClient,
  players: PlayerData[],
) => {
  if (!players?.length) throw new Error("No players to pick from");
  const previousHumans = players.filter((player) => !player.is_bot);

  // reset bots and votes
  await updateGamePlayers(supabase, {
    game_id: players[0].game_id,
    vote: null,
    vote_blank: false,
    is_bot: false,
  });

  // chance to add no bot if there was a bot before
  const previousBot = players.find((player) => player.is_bot);
  const noBotThisRound = Math.random() <= 1 / (players.length + 1);
  if (previousBot && noBotThisRound) return;

  // set random player as bot
  const randomPlayer =
    previousHumans[Math.floor(Math.random() * players.length)];
  await updatePlayer(supabase, {
    id: randomPlayer.id,
    is_bot: true,
  });
};
