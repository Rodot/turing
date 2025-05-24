import type { GameData } from "../_types/Database.type.ts";

// Check if all players have voted
export function checkIfAllPlayersVoted(game: GameData): boolean {
  const activePlayerIds = new Set(game.players.map((p) => p.id));
  const numHumans = game.players.filter((player) => !player.is_bot).length;

  const numVotes = game.players.filter(
    (player) =>
      (player.vote && activePlayerIds.has(player.vote)) || player.vote_blank,
  ).length;

  const allPlayersVoted = numVotes >= numHumans && game.players.length > 1;
  console.log(
    `All players voted: ${allPlayersVoted} (Votes: ${numVotes}, Humans: ${numHumans}, Total: ${game.players.length})`,
  );
  return allPlayersVoted;
}
