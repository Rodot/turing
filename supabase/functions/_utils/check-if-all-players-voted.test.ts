import { assertEquals } from "std/assert/mod.ts";
import { checkIfAllPlayersVoted } from "./check-if-all-players-voted.ts";
import type { GameData } from "../_types/Database.type.ts";

// Helper function to create test game data
function createGameData(
  players: Array<{
    id: string;
    name: string;
    is_bot?: boolean;
    vote?: string | null;
    vote_blank?: boolean;
    score?: number;
  }>,
): GameData {
  return {
    id: "test-game-id",
    created_at: "2024-01-01T00:00:00Z",
    status: "voting",
    lang: "en",
    last_bot_id: null,
    players: players.map((p) => ({
      id: p.id,
      name: p.name,
      is_bot: p.is_bot || false,
      vote: p.vote || null,
      vote_blank: p.vote_blank || false,
      score: p.score || 0,
    })),
  };
}

Deno.test(
  "checkIfAllPlayersVoted - returns true when all humans have voted",
  () => {
    const game = createGameData([
      { id: "player1", name: "Alice", vote: "player2" },
      { id: "player2", name: "Bob", vote: "player1" },
      { id: "player3", name: "Charlie", is_bot: true },
    ]);

    const result = checkIfAllPlayersVoted(game);
    assertEquals(result, true);
  },
);

Deno.test(
  "checkIfAllPlayersVoted - returns false when not all humans have voted",
  () => {
    const game = createGameData([
      { id: "player1", name: "Alice", vote: "player2" },
      { id: "player2", name: "Bob" }, // No vote
      { id: "player3", name: "Charlie", is_bot: true },
    ]);

    const result = checkIfAllPlayersVoted(game);
    assertEquals(result, false);
  },
);

Deno.test("checkIfAllPlayersVoted - handles blank votes correctly", () => {
  const game = createGameData([
    { id: "player1", name: "Alice", vote_blank: true },
    { id: "player2", name: "Bob", vote: "player1" },
  ]);

  const result = checkIfAllPlayersVoted(game);
  assertEquals(result, true);
});

Deno.test("checkIfAllPlayersVoted - returns false with only one player", () => {
  const game = createGameData([
    { id: "player1", name: "Alice", vote_blank: true },
  ]);

  const result = checkIfAllPlayersVoted(game);
  assertEquals(result, false);
});
