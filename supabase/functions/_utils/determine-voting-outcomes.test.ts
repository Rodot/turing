import { assertEquals } from "std/assert/mod.ts";
import { determineVotingOutcomes } from "./determine-voting-outcomes.ts";
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
    status: "voting",
    lang: "en",
    players: players.map((p) => ({
      id: p.id,
      name: p.name,
      is_bot: p.is_bot || false,
      vote: p.vote || null,
      vote_blank: p.vote_blank || false,
      score: p.score || 0,
    })),
  } as GameData;
}

Deno.test("Bot exists - players who find bot get points", () => {
  const game = createGameData([
    { id: "alice", name: "Alice", vote: "bot" },
    { id: "bob", name: "Bob", vote: "bot" },
    { id: "bot", name: "Charlie", is_bot: true },
  ]);

  const outcomes = determineVotingOutcomes(game);

  // Alice and Bob should each get 1 point for finding the bot
  // Bot gets 0 points (got most votes, failed to deceive)
  assertEquals(outcomes.length, 2);

  const aliceOutcome = outcomes.find((o) => o.playerId === "alice");
  const bobOutcome = outcomes.find((o) => o.playerId === "bob");

  assertEquals(aliceOutcome?.rewardReason, "foundBot");
  assertEquals(aliceOutcome?.pointsEarned, 1);
  assertEquals(bobOutcome?.rewardReason, "foundBot");
  assertEquals(bobOutcome?.pointsEarned, 1);
});

Deno.test("Bot exists - bot avoids detection and gets points", () => {
  const game = createGameData([
    { id: "alice", name: "Alice", vote: "bob" },
    { id: "bob", name: "Bob", vote: "alice" },
    { id: "bot", name: "Charlie", is_bot: true },
  ]);

  const outcomes = determineVotingOutcomes(game);

  // Bot should get 1 point for avoiding detection (got 0 votes, not the most)
  // Alice and Bob should each get 1 point for bestActing (tied for most votes with 1 each)
  // No one found the bot, so no foundBot points
  assertEquals(outcomes.length, 3);

  const botOutcome = outcomes.find((o) => o.playerId === "bot");
  const aliceOutcome = outcomes.find((o) => o.playerId === "alice");
  const bobOutcome = outcomes.find((o) => o.playerId === "bob");

  assertEquals(botOutcome?.rewardReason, "botAvoided");
  assertEquals(botOutcome?.pointsEarned, 1);
  assertEquals(aliceOutcome?.rewardReason, "bestActing");
  assertEquals(aliceOutcome?.pointsEarned, 1);
  assertEquals(bobOutcome?.rewardReason, "bestActing");
  assertEquals(bobOutcome?.pointsEarned, 1);
});

Deno.test("Bot exists - bot gets caught but ties for most votes", () => {
  const game = createGameData([
    { id: "alice", name: "Alice", vote: "bot" },
    { id: "bob", name: "Bob", vote: "alice" },
    { id: "bot", name: "Charlie", is_bot: true },
  ]);

  const outcomes = determineVotingOutcomes(game);

  // Alice gets point for finding bot + point for bestActing (tied for most votes)
  // Bot gets point for not being sole highest vote getter (tied with Alice at 1 vote each)
  assertEquals(outcomes.length, 3);

  const aliceOutcomes = outcomes.filter((o) => o.playerId === "alice");
  const botOutcome = outcomes.find((o) => o.playerId === "bot");

  assertEquals(aliceOutcomes.length, 2);
  assertEquals(
    aliceOutcomes.find((o) => o.rewardReason === "foundBot")?.pointsEarned,
    1,
  );
  assertEquals(
    aliceOutcomes.find((o) => o.rewardReason === "bestActing")?.pointsEarned,
    1,
  );
  assertEquals(botOutcome?.rewardReason, "botAvoided");
});

Deno.test("Bot exists - bot gets most votes and fails", () => {
  const game = createGameData([
    { id: "alice", name: "Alice", vote: "bot" },
    { id: "bob", name: "Bob", vote: "bot" },
    { id: "carol", name: "Carol", vote: "alice" },
    { id: "bot", name: "Charlie", is_bot: true },
  ]);

  const outcomes = determineVotingOutcomes(game);

  // Alice and Bob get points for finding bot
  // Bot gets 0 points (got 2 votes, more than anyone else - failed to deceive)
  assertEquals(outcomes.length, 2);

  const foundBotOutcomes = outcomes.filter(
    (o) => o.rewardReason === "foundBot",
  );
  assertEquals(foundBotOutcomes.length, 2);
});

Deno.test("No bot - players who vote blank get points", () => {
  const game = createGameData([
    { id: "alice", name: "Alice", vote_blank: true },
    { id: "bob", name: "Bob", vote: "carol" },
    { id: "carol", name: "Carol", vote: "bob" },
  ]);

  const outcomes = determineVotingOutcomes(game);

  // Alice gets point for correct blank vote
  // Bob and Carol each get point for best acting (tied for most votes)
  assertEquals(outcomes.length, 3);

  const aliceOutcome = outcomes.find((o) => o.playerId === "alice");
  const bobOutcome = outcomes.find((o) => o.playerId === "bob");
  const carolOutcome = outcomes.find((o) => o.playerId === "carol");

  assertEquals(aliceOutcome?.rewardReason, "correctlyGuessedNoBot");
  assertEquals(bobOutcome?.rewardReason, "bestActing");
  assertEquals(carolOutcome?.rewardReason, "bestActing");
});

Deno.test("No bot - single best actor", () => {
  const game = createGameData([
    { id: "alice", name: "Alice", vote: "bob" },
    { id: "bob", name: "Bob", vote: "bob" },
    { id: "carol", name: "Carol", vote: "alice" },
  ]);

  const outcomes = determineVotingOutcomes(game);

  // Bob gets point for best acting (2 votes, most convincing fake bot)
  assertEquals(outcomes.length, 1);

  const bobOutcome = outcomes.find((o) => o.playerId === "bob");
  assertEquals(bobOutcome?.rewardReason, "bestActing");
  assertEquals(bobOutcome?.pointsEarned, 1);
});

Deno.test("No bot - everyone votes blank", () => {
  const game = createGameData([
    { id: "alice", name: "Alice", vote_blank: true },
    { id: "bob", name: "Bob", vote_blank: true },
    { id: "carol", name: "Carol", vote_blank: true },
  ]);

  const outcomes = determineVotingOutcomes(game);

  // Everyone gets point for correct blank vote
  assertEquals(outcomes.length, 3);

  outcomes.forEach((outcome) => {
    assertEquals(outcome.rewardReason, "correctlyGuessedNoBot");
    assertEquals(outcome.pointsEarned, 1);
  });
});

Deno.test(
  "Bot exists - player gets 2 points (finds bot + gets voted as bot)",
  () => {
    const game = createGameData([
      { id: "alice", name: "Alice", vote: "bot" }, // finds bot
      { id: "bob", name: "Bob", vote: "alice" }, // votes for alice (thinks alice is bot)
      { id: "carol", name: "Carol", vote: "alice" }, // votes for alice (thinks alice is bot)
      { id: "bot", name: "Bot", is_bot: true },
    ]);

    const outcomes = determineVotingOutcomes(game);

    // Alice should get 2 points: 1 for finding bot + 1 for being most voted (best acting)
    // Bot should get 1 point for avoiding detection (not sole highest vote getter)
    assertEquals(outcomes.length, 3);

    const aliceOutcomes = outcomes.filter((o) => o.playerId === "alice");
    const botOutcome = outcomes.find((o) => o.playerId === "bot");

    assertEquals(aliceOutcomes.length, 2);
    assertEquals(
      aliceOutcomes.find((o) => o.rewardReason === "foundBot")?.pointsEarned,
      1,
    );
    assertEquals(
      aliceOutcomes.find((o) => o.rewardReason === "bestActing")?.pointsEarned,
      1,
    );
    assertEquals(botOutcome?.rewardReason, "botAvoided");
    assertEquals(botOutcome?.pointsEarned, 1);
  },
);

Deno.test("No votes cast", () => {
  const game = createGameData([
    { id: "alice", name: "Alice" },
    { id: "bob", name: "Bob" },
  ]);

  const outcomes = determineVotingOutcomes(game);
  assertEquals(outcomes.length, 0);
});
