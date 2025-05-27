import { GameData, PlayerData } from "../_types/Database.type.ts";

/**
 * Pure function to calculate voting progress
 * @param game The current game state
 * @returns Progress as a number between 0 and 1, or null if not in voting phase
 */
export function getVotingProgress(game: GameData): number | null {
  if (game.status !== "voting") {
    return null;
  }

  const players = game.players || [];
  const humans = players.filter((player: PlayerData) => !player.is_bot);
  const humansWhoVoted = humans.filter(
    (player: PlayerData) => player.vote || player.vote_blank,
  );

  return humans.length > 0 ? humansWhoVoted.length / humans.length : 0;
}
