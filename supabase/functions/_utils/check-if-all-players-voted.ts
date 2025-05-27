import type { GameData } from "../_types/Database.type.ts";
import { getVotingProgress } from "../_shared/voting-progress.ts";

// Check if all players have voted
export function checkIfAllPlayersVoted(game: GameData): boolean {
  const votingProgress = getVotingProgress(game);
  return votingProgress === 1 && game.players.length > 1;
}
