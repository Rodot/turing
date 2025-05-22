// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
/// <reference types="https://esm.sh/@supabase/functions-js@2.4.4/src/edge-runtime.d.ts" />

import { fetchMessages, insertMessage } from "../_queries/messages.query.ts";
import { fetchProfiles, updateProfile } from "../_queries/profiles.query.ts";
import { fetchGame, updateGame } from "../_queries/game.query.ts";
import { headers } from "../_utils/cors.ts";
import { setRandomPlayerAsBotAndResetVotes } from "../_utils/vote.ts";
import { createSupabaseClient } from "../_utils/supabase.ts";
import { pickRandom } from "../_shared/utils.ts";
import { iceBreakers } from "../_shared/lang.ts";
import { ProfileData } from "../_types/Database.type.ts";
import { MessageData } from "../_types/Database.type.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers });
  }

  try {
    const { gameId, profileId, vote } = (await req.json()) as {
      gameId: string;
      profileId: string;
      vote: string;
    };
    if (!gameId) throw new Error("Missing gameId");
    if (!profileId) throw new Error("Missing profileId");
    if (!vote) throw new Error("Missing vote");

    const supabase = createSupabaseClient(req);
    console.log("Voting", { gameId, profileId });

    // Apply profile vote
    if (vote === "blank") {
      await updateProfile(supabase, {
        id: profileId,
        game_id: gameId,
        vote: null,
        vote_blank: true,
      });
    } else {
      await updateProfile(supabase, {
        id: profileId,
        game_id: gameId,
        vote,
        vote_blank: false,
      });
    }

    // Gather all data needed to determine points
    const votingData = await gatherVotingData(supabase, gameId);

    // Process voting if all players have voted
    if (votingData.allVoted && votingData.profiles.length > 1) {
      console.log("All profiles have voted", gameId);

      // Give time to read results
      await new Promise((resolve) => setTimeout(resolve, 8000));

      // Determine who got points and why
      const pointAllocations = determinePointsAllocation(votingData);

      // Update profiles who got points
      await updatePlayerPoints(supabase, pointAllocations, gameId);

      // Post messages about who got points and why
      await postPointsMessages(supabase, pointAllocations, votingData, gameId);

      // Get updated profile data for end game check
      const profilesAfter = await fetchProfiles(supabase, gameId);
      const maxScore = Math.max(...profilesAfter.map((p) => p.score));

      if (maxScore >= 5) {
        // Game over
        console.log("Game over", gameId);

        // Announce winner
        const winners = profilesAfter.filter((p) => p.score === maxScore);
        if (winners.length) {
          const message = `${winners.map((w) => w.name).join(" and ")} won! 🏆`;
          await insertMessage(supabase, {
            author: "system",
            content: message,
            game_id: gameId,
          });
        }

        // Close the game
        await updateGame(supabase, gameId, { status: "over" });
      } else {
        // Next round
        console.log("Next round", gameId);

        // Set up next vote
        const game = await fetchGame(supabase, gameId);

        // Reset votes and set random profile as bot
        await Promise.all([
          setRandomPlayerAsBotAndResetVotes(supabase, votingData.profiles),
          updateGame(supabase, gameId, {
            status: "talking",
          }),
          insertMessage(supabase, {
            game_id: gameId,
            author: "icebreaker",
            content: "💡 " + pickRandom(iceBreakers[game?.lang ?? "en"]),
          }),
        ]);
      }
    }

    const data = JSON.stringify({});
    return new Response(data, { headers, status: 200 });
  } catch (error) {
    console.error(error);
    const data = JSON.stringify({ error });
    return new Response(data, { headers, status: 400 });
  }
});

// Types for the voting data processing
type VotingData = {
  profiles: ProfileData[];
  messages: MessageData[];
  numHumans: number;
  botProfile: ProfileData | undefined;
  botVoters: ProfileData[];
  blankVoters: ProfileData[];
  voteCounts: Record<string, number>;
  numVotes: number;
  humanImposters: ProfileData[];
  allVoted: boolean;
};

type PointAllocation = {
  profile: ProfileData;
  points: number;
  reason:
    | "foundBot"
    | "botEscaped"
    | "moreConvincingThanBot"
    | "correctlyGuessedNoBot";
};

// STEP 1: Gather all the data needed to determine point allocation
async function gatherVotingData(
  supabase: ReturnType<typeof createSupabaseClient>,
  gameId: string,
) {
  // Fetch profiles and messages data
  const [profiles, messages] = await Promise.all([
    fetchProfiles(supabase, gameId),
    fetchMessages(supabase, gameId),
  ]);

  // Analyze profile data
  const numHumans = profiles.filter((profile) => !profile.is_bot).length;
  const botProfile = profiles.find((profile) => profile.is_bot);
  const botVoters = profiles.filter(
    (profile) => profile.vote === botProfile?.id,
  );
  const blankVoters = profiles.filter((profile) => profile.vote_blank === true);

  // Count votes for each profile
  const voteCounts = profiles.reduce(
    (counts, profile) => {
      if (profile.vote && !profile.vote_blank) {
        counts[profile.vote] = (counts[profile.vote] || 0) + 1;
      }
      return counts;
    },
    {} as Record<string, number>,
  );

  // Calculate total votes
  const numVotes = profiles.filter(
    (profile) => profile.vote || profile.vote_blank,
  ).length;

  // Find the maximum number of votes any profile received
  const maxVotes = botProfile ? Math.max(...Object.values(voteCounts)) : 0;

  // Calculate human imposters (humans with more votes than bot AND have the most votes)
  const humanImposters = botProfile
    ? profiles.filter(
        (profile) =>
          !profile.is_bot &&
          (voteCounts[profile.id] || 0) > (voteCounts[botProfile.id] || 0) &&
          (voteCounts[profile.id] || 0) === maxVotes,
      )
    : [];

  return {
    profiles,
    messages,
    numHumans,
    botProfile,
    botVoters,
    blankVoters,
    voteCounts,
    numVotes,
    humanImposters,
    allVoted: numVotes >= numHumans,
  };
}

// STEP 2: Function to determine who gets points and why
function determinePointsAllocation(votingData: VotingData): PointAllocation[] {
  const {
    botProfile,
    botVoters,
    blankVoters,
    humanImposters,
    profiles,
    voteCounts,
  } = votingData;

  const pointAllocations: PointAllocation[] = [];

  // Points for bot voters
  if (botProfile && botVoters.length > 0) {
    botVoters.forEach((voter) => {
      pointAllocations.push({
        profile: voter,
        points: 1,
        reason: "foundBot",
      });
    });
  }

  // Points for bot if nobody found it
  if (botProfile && botVoters.length === 0) {
    pointAllocations.push({
      profile: botProfile,
      points: 1,
      reason: "botEscaped",
    });
  }

  // Points for human imposters
  if (humanImposters.length > 0) {
    humanImposters.forEach((imposter) => {
      pointAllocations.push({
        profile: imposter,
        points: 1,
        reason: "moreConvincingThanBot",
      });
    });
  }

  // Points for players with most votes when there's no bot (similar to human imposters)
  if (!botProfile && Object.keys(voteCounts).length > 0) {
    const maxVotes = Math.max(...Object.values(voteCounts));
    const mostVotedProfiles = profiles.filter(
      (profile) => (voteCounts[profile.id] || 0) === maxVotes && maxVotes > 0,
    );

    mostVotedProfiles.forEach((profile) => {
      pointAllocations.push({
        profile,
        points: 1,
        reason: "moreConvincingThanBot",
      });
    });
  }

  // Points for blank voters when no bot
  if (!botProfile && blankVoters.length > 0) {
    blankVoters.forEach((voter) => {
      pointAllocations.push({
        profile: voter,
        points: 1,
        reason: "correctlyGuessedNoBot",
      });
    });
  }

  return pointAllocations;
}

// STEP 3: Function to update profiles who got points
async function updatePlayerPoints(
  supabase: ReturnType<typeof createSupabaseClient>,
  pointAllocations: PointAllocation[],
  gameId: string,
) {
  // Reduce to calculate total points per player
  const pointsByPlayer = pointAllocations.reduce<
    Record<string, { profile: ProfileData; totalPoints: number }>
  >((acc, allocation) => {
    const { profile, points } = allocation;
    const profileId = profile.id;

    if (!acc[profileId]) {
      acc[profileId] = { profile, totalPoints: 0 };
    }

    acc[profileId].totalPoints += points;
    return acc;
  }, {});

  // Update each player with their total points
  const updatePromises = Object.values(pointsByPlayer).map(
    ({ profile, totalPoints }) =>
      updateProfile(supabase, {
        id: profile.id,
        game_id: gameId,
        score: profile.score + totalPoints,
      }),
  );

  await Promise.all(updatePromises);
}

// STEP 4: Function to post messages about who got points and why
async function postPointsMessages(
  supabase: ReturnType<typeof createSupabaseClient>,
  pointAllocations: PointAllocation[],
  votingData: VotingData,
  gameId: string,
) {
  const { botProfile, humanImposters } = votingData;

  // Group profiles by reason for better messaging
  const foundBotPlayers = pointAllocations
    .filter((a) => a.reason === "foundBot")
    .map((a) => a.profile);

  const correctlyGuessedNoBotPlayers = pointAllocations
    .filter((a) => a.reason === "correctlyGuessedNoBot")
    .map((a) => a.profile);

  const mostVotedNoBotPlayers = pointAllocations
    .filter((a) => a.reason === "moreConvincingThanBot" && !botProfile)
    .map((a) => a.profile);

  // Messages to post
  const messages: string[] = [];

  // Create message for bot voters
  if (botProfile && foundBotPlayers.length > 0) {
    messages.push(
      `+1 🧠 for ${foundBotPlayers
        .map((p) => p.name)
        .join(" and ")} who guessed that ${botProfile.name} was the AI 🤖`,
    );
  }

  // Create message for escaped bot
  if (botProfile && foundBotPlayers.length === 0) {
    messages.push(`+1 🧠 for ${botProfile.name} for pretending to be human 🤖`);
  }

  // Create message for correct blank voters
  if (!botProfile && correctlyGuessedNoBotPlayers.length > 0) {
    messages.push(
      `+1 🧠 for ${correctlyGuessedNoBotPlayers
        .map((p) => p.name)
        .join(" and ")} who realized there was no AI ❌`,
    );
  }

  // Create message when nobody guessed there was no bot
  if (!botProfile && correctlyGuessedNoBotPlayers.length === 0) {
    messages.push(`Nobody guessed that there was no AI ❌`);
  }

  // Add message for humans who got more votes than the bot
  if (humanImposters.length > 0) {
    messages.push(
      `+1 🧠 for ${humanImposters
        .map((p) => p.name)
        .join(" and ")} for pretending to be the AI 👤`,
    );
  }

  // Add message for most voted players when there's no bot
  if (!botProfile && mostVotedNoBotPlayers.length > 0) {
    messages.push(
      `+1 🧠 for ${mostVotedNoBotPlayers
        .map((p) => p.name)
        .join(" and ")} for pretending to be the AI 👤`,
    );
  }

  // Post all messages sequentially
  for (const message of messages) {
    await insertMessage(supabase, {
      author: "system",
      content: message,
      game_id: gameId,
    });
  }
}
