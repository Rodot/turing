import type { GameData } from "../_types/Database.type.ts";

export type RewardReason =
  | "foundBot"
  | "botAvoided"
  | "correctlyGuessedNoBot"
  | "bestActing";

export type VotingOutcome = {
  playerId: string;
  playerName: string;
  pointsEarned: number;
  rewardReason: RewardReason;
};

// Determine voting outcomes using simple, intuitive scoring
// Players can earn multiple points per round for different accomplishments
export function determineVotingOutcomes(game: GameData): VotingOutcome[] {
  const votingOutcomes: VotingOutcome[] = [];
  const activePlayerIds = new Set(game.players.map((p) => p.id));
  const botPlayer = game.players.find((player) => player.is_bot);

  // Count votes for each player
  const voteCounts = game.players.reduce(
    (counts, player) => {
      if (
        player.vote &&
        !player.vote_blank &&
        activePlayerIds.has(player.vote)
      ) {
        counts[player.vote] = (counts[player.vote] || 0) + 1;
      }
      return counts;
    },
    {} as Record<string, number>,
  );

  // Find the maximum number of votes received
  const maxVotes =
    Object.keys(voteCounts).length > 0
      ? Math.max(...Object.values(voteCounts))
      : 0;

  if (botPlayer) {
    // Scenario: There is a bot in the game

    // 1. Players who correctly identified the bot get points
    const botVoters = game.players.filter(
      (player) => player.vote === botPlayer.id,
    );

    botVoters.forEach((voter) => {
      votingOutcomes.push({
        playerId: voter.id,
        playerName: voter.name,
        pointsEarned: 1,
        rewardReason: "foundBot",
      });
    });

    // 2. Bot gets point if they didn't get the most votes (ties are OK)
    const botVotes = voteCounts[botPlayer.id] || 0;
    const botIsNotSoleHighest =
      botVotes < maxVotes ||
      (botVotes === maxVotes &&
        Object.values(voteCounts).filter((v) => v === maxVotes).length > 1);

    if (botIsNotSoleHighest) {
      votingOutcomes.push({
        playerId: botPlayer.id,
        playerName: botPlayer.name,
        pointsEarned: 1,
        rewardReason: "botAvoided",
      });
    }

    // 3. Human players with the most votes also get points for best acting
    // (This allows a player to get both foundBot and bestActing points)
    if (maxVotes > 0) {
      const bestActors = game.players.filter(
        (player) =>
          !player.is_bot && // Only humans can get bestActing points
          (voteCounts[player.id] || 0) === maxVotes,
      );

      bestActors.forEach((actor) => {
        votingOutcomes.push({
          playerId: actor.id,
          playerName: actor.name,
          pointsEarned: 1,
          rewardReason: "bestActing",
        });
      });
    }
  } else {
    // Scenario: There is no bot in the game

    // 1. Players who voted blank correctly guessed there was no bot
    const blankVoters = game.players.filter(
      (player) => player.vote_blank === true,
    );

    blankVoters.forEach((voter) => {
      votingOutcomes.push({
        playerId: voter.id,
        playerName: voter.name,
        pointsEarned: 1,
        rewardReason: "correctlyGuessedNoBot",
      });
    });

    // 2. Players with the most votes were the best actors (most convincing fake bots)
    if (maxVotes > 0) {
      const bestActors = game.players.filter(
        (player) => (voteCounts[player.id] || 0) === maxVotes,
      );

      bestActors.forEach((actor) => {
        votingOutcomes.push({
          playerId: actor.id,
          playerName: actor.name,
          pointsEarned: 1,
          rewardReason: "bestActing",
        });
      });
    }
  }

  console.log("Voting outcomes determined:", votingOutcomes);
  return votingOutcomes;
}
