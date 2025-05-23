import { SupabaseClient } from "https://esm.sh/v135/@supabase/supabase-js@2.43.2/dist/module/index.js";
import { PlayerData } from "../_types/Database.type.ts";
import { updateAllPlayersInGame } from "../_queries/game.query.ts";

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
};
