import type { GameData } from "../_types/Database.type.ts";

export type RewardReason =
  | "foundAI"
  | "wronglyAccusedHuman"
  | "realizedNoAI"
  | "missedAI"
  | "mostVotedHuman"
  | "invisibleAI";

export type VotingOutcome = {
  playerId: string;
  playerName: string;
  pointsEarned: number;
  rewardReason: RewardReason;
  votedForName?: string;
};

// Determine voting outcomes using the new scoring logic:
// - If human votes for AI: human gets +1 point "foundAI"
// - If human votes for human: voter gets 0 points "wronglyAccusedHuman"
// - If human votes blank with AI present: voter gets 0 points "missedAI"
// - If human votes blank with no AI: voter gets +1 point "realizedNoAI"
// - If human receives most votes: human gets +1 point "mostVotedHuman" (ties all get +1)
// - If AI receives zero votes: AI gets +2 points "invisibleAI"
// - Player scores cannot go below 0
export function determineVotingOutcomes(game: GameData): VotingOutcome[] {
  const votingOutcomes: VotingOutcome[] = [];
  const activePlayerIds = new Set(game.players.map((p) => p.id));
  const botPlayer = game.players.find((player) => player.is_bot);

  // Count votes for each player
  const voteCounts = new Map<string, number>();
  for (const player of game.players) {
    if (player.vote && !player.vote_blank && activePlayerIds.has(player.vote)) {
      const currentCount = voteCounts.get(player.vote) || 0;
      voteCounts.set(player.vote, currentCount + 1);
    }
  }

  if (botPlayer) {
    // Scenario: AI exists

    // Check if AI got zero votes - award +2 points to AI
    const aiVotes = voteCounts.get(botPlayer.id) || 0;
    if (aiVotes === 0) {
      votingOutcomes.push({
        playerId: botPlayer.id,
        playerName: botPlayer.name,
        pointsEarned: 2,
        rewardReason: "invisibleAI",
      });
    }

    // Find humans who got the most votes (excluding AI from consideration)
    const humanPlayers = game.players.filter((p) => !p.is_bot);
    let maxVotes = 0;
    const mostVotedHumans: string[] = [];

    for (const human of humanPlayers) {
      const votes = voteCounts.get(human.id) || 0;
      if (votes > maxVotes) {
        maxVotes = votes;
        mostVotedHumans.length = 0; // Clear array
        mostVotedHumans.push(human.id);
      } else if (votes === maxVotes && votes > 0) {
        mostVotedHumans.push(human.id);
      }
    }

    // Award +1 point to most voted humans (if any got votes)
    for (const humanId of mostVotedHumans) {
      const human = game.players.find((p) => p.id === humanId);
      if (human) {
        votingOutcomes.push({
          playerId: human.id,
          playerName: human.name,
          pointsEarned: 1,
          rewardReason: "mostVotedHuman",
        });
      }
    }
  } else {
    // Scenario: No AI exists - all players are humans

    // Find players who got the most votes
    let maxVotes = 0;
    const mostVotedPlayers: string[] = [];

    for (const player of game.players) {
      const votes = voteCounts.get(player.id) || 0;
      if (votes > maxVotes) {
        maxVotes = votes;
        mostVotedPlayers.length = 0; // Clear array
        mostVotedPlayers.push(player.id);
      } else if (votes === maxVotes && votes > 0) {
        mostVotedPlayers.push(player.id);
      }
    }

    // Award +1 point to most voted players (if any got votes)
    for (const playerId of mostVotedPlayers) {
      const player = game.players.find((p) => p.id === playerId);
      if (player) {
        votingOutcomes.push({
          playerId: player.id,
          playerName: player.name,
          pointsEarned: 1,
          rewardReason: "mostVotedHuman",
        });
      }
    }
  }

  if (botPlayer) {
    // Scenario: There is an AI in the game

    for (const player of game.players) {
      if (player.is_bot) continue; // Skip the AI player

      if (player.vote === botPlayer.id) {
        // Human voted for the AI - give voter 1 point for finding it
        votingOutcomes.push({
          playerId: player.id,
          playerName: player.name,
          pointsEarned: 1,
          rewardReason: "foundAI",
        });
      } else if (
        player.vote &&
        !player.vote_blank &&
        activePlayerIds.has(player.vote) &&
        player.vote !== botPlayer.id
      ) {
        // Human voted for another human - voter gets 0 points for wrong accusation
        const votedPlayer = game.players.find((p) => p.id === player.vote);
        if (votedPlayer && !votedPlayer.is_bot) {
          votingOutcomes.push({
            playerId: player.id,
            playerName: player.name,
            pointsEarned: 0,
            rewardReason: "wronglyAccusedHuman",
            votedForName: votedPlayer.name,
          });
        }
      } else if (player.vote_blank === true) {
        // Human voted blank when AI exists - voter gets 0 points for missing the AI
        votingOutcomes.push({
          playerId: player.id,
          playerName: player.name,
          pointsEarned: 0,
          rewardReason: "missedAI",
        });
      }
    }
  } else {
    // Scenario: There is no AI in the game

    for (const player of game.players) {
      if (player.vote_blank === true) {
        // Human voted blank and there's no AI - give voter 1 point for realizing it
        votingOutcomes.push({
          playerId: player.id,
          playerName: player.name,
          pointsEarned: 1,
          rewardReason: "realizedNoAI",
        });
      } else if (
        player.vote &&
        !player.vote_blank &&
        activePlayerIds.has(player.vote)
      ) {
        // Human voted for another human when no AI exists - voter gets 0 points for wrong accusation
        const votedPlayer = game.players.find((p) => p.id === player.vote);
        if (votedPlayer) {
          votingOutcomes.push({
            playerId: player.id,
            playerName: player.name,
            pointsEarned: 0,
            rewardReason: "wronglyAccusedHuman",
            votedForName: votedPlayer.name,
          });
        }
      }
    }
  }

  console.log("Voting outcomes determined:", votingOutcomes);
  return votingOutcomes;
}
