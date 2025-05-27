import type { GameData } from "../_types/Database.type.ts";

export type RewardReason =
  | "foundAI"
  | "convincedVoter"
  | "realizedNoAI"
  | "missedAI";

export type VotingOutcome = {
  playerId: string;
  playerName: string;
  pointsEarned: number;
  rewardReason: RewardReason;
  votedForName?: string;
};

// Determine voting outcomes using the new scoring logic:
// - If human votes for AI: human gets 1 point "foundAI"
// - If human votes for human: voted human gets 1 point "convincedVoter"
// - If human votes blank with AI present: 0 points "missedAI"
// - If human votes blank with no AI: 1 point "realizedNoAI"
export function determineVotingOutcomes(game: GameData): VotingOutcome[] {
  const votingOutcomes: VotingOutcome[] = [];
  const activePlayerIds = new Set(game.players.map((p) => p.id));
  const botPlayer = game.players.find((player) => player.is_bot);

  if (botPlayer) {
    // Scenario: There is an AI in the game

    for (const player of game.players) {
      if (player.is_bot) continue; // Skip the AI player

      if (player.vote === botPlayer.id) {
        // Human voted for the AI - give them 1 point for finding it
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
        // Human voted for another human - give the voted human 1 point
        const votedPlayer = game.players.find((p) => p.id === player.vote);
        if (votedPlayer && !votedPlayer.is_bot) {
          votingOutcomes.push({
            playerId: votedPlayer.id,
            playerName: votedPlayer.name,
            pointsEarned: 1,
            rewardReason: "convincedVoter",
            votedForName: player.name,
          });
        }
      } else if (player.vote_blank === true) {
        // Human voted blank when AI exists - 0 points for missing the AI
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
        // Human voted blank and there's no AI - give them 1 point for realizing it
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
        // Human voted for another human - give the voted human 1 point
        const votedPlayer = game.players.find((p) => p.id === player.vote);
        if (votedPlayer) {
          votingOutcomes.push({
            playerId: votedPlayer.id,
            playerName: votedPlayer.name,
            pointsEarned: 1,
            rewardReason: "convincedVoter",
            votedForName: player.name,
          });
        }
      }
    }
  }

  console.log("Voting outcomes determined:", votingOutcomes);
  return votingOutcomes;
}
