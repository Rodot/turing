import { SupabaseClient } from "https://esm.sh/v135/@supabase/supabase-js@2.43.2/dist/module/index.js";
import { ProfileData } from "../_types/Database.type.ts";
import {
  updateGameProfiles,
  updateProfile,
} from "../_queries/profiles.query.ts";

export const setRandomPlayerAsBotAndResetVotes = async (
  supabase: SupabaseClient,
  profiles: ProfileData[],
) => {
  if (!profiles?.length) throw new Error("No profiles to pick from");
  const previousHumans = profiles.filter((profile) => !profile.is_bot);

  // reset bots and votes
  await updateGameProfiles(supabase, {
    game_id: profiles[0].game_id,
    vote: null,
    vote_blank: false,
    is_bot: false,
  });

  // chance to add no bot if there was a bot before
  const previousBot = profiles.find((profile) => profile.is_bot);
  const noBotThisRound = Math.random() <= 1 / (profiles.length + 1);
  if (previousBot && noBotThisRound) return;

  // set random profile as bot
  const randomProfile =
    previousHumans[Math.floor(Math.random() * profiles.length)];
  await updateProfile(supabase, {
    id: randomProfile.id,
    is_bot: true,
  });
};
