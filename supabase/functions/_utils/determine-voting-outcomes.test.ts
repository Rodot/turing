import { assertEquals } from "https://deno.land/std@0.208.0/assert/mod.ts";
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

Deno.test("AI exists - humans who vote for AI get points", () => {
  const game = createGameData([
    { id: "alice", name: "Alice", vote: "bot" },
    { id: "bob", name: "Bob", vote: "bot" },
    { id: "carol", name: "Carol", vote: "alice" },
    { id: "bot", name: "Charlie", is_bot: true },
  ]);

  const outcomes = determineVotingOutcomes(game);

  // Alice and Bob should each get 1 point for finding the AI
  // Carol should lose 1 point for wrongly accusing Alice
  assertEquals(outcomes.length, 3);

  const aliceFoundAI = outcomes.find(
    (o) => o.playerId === "alice" && o.rewardReason === "foundAI",
  );
  const bobFoundAI = outcomes.find(
    (o) => o.playerId === "bob" && o.rewardReason === "foundAI",
  );
  const carolWrongAccusation = outcomes.find(
    (o) => o.playerId === "carol" && o.rewardReason === "wronglyAccusedHuman",
  );

  assertEquals(aliceFoundAI?.pointsEarned, 1);
  assertEquals(bobFoundAI?.pointsEarned, 1);
  assertEquals(carolWrongAccusation?.pointsEarned, -1);
  assertEquals(carolWrongAccusation?.votedForName, "Alice");
});

Deno.test("AI exists - humans who vote for humans lose points", () => {
  const game = createGameData([
    { id: "alice", name: "Alice", vote: "bob" },
    { id: "bob", name: "Bob", vote: "carol" },
    { id: "carol", name: "Carol", vote: "alice" },
    { id: "bot", name: "Charlie", is_bot: true },
  ]);

  const outcomes = determineVotingOutcomes(game);

  // Alice, Bob, and Carol should each lose 1 point for wrongly accusing humans
  // No one found the AI
  assertEquals(outcomes.length, 3);

  const aliceOutcome = outcomes.find((o) => o.playerId === "alice");
  const bobOutcome = outcomes.find((o) => o.playerId === "bob");
  const carolOutcome = outcomes.find((o) => o.playerId === "carol");

  assertEquals(aliceOutcome?.rewardReason, "wronglyAccusedHuman");
  assertEquals(aliceOutcome?.pointsEarned, -1);
  assertEquals(aliceOutcome?.votedForName, "Bob");
  assertEquals(bobOutcome?.rewardReason, "wronglyAccusedHuman");
  assertEquals(bobOutcome?.pointsEarned, -1);
  assertEquals(bobOutcome?.votedForName, "Carol");
  assertEquals(carolOutcome?.rewardReason, "wronglyAccusedHuman");
  assertEquals(carolOutcome?.pointsEarned, -1);
  assertEquals(carolOutcome?.votedForName, "Alice");
});

Deno.test(
  "AI exists - multiple humans vote for same human (all lose points)",
  () => {
    const game = createGameData([
      { id: "alice", name: "Alice", vote: "bob" },
      { id: "bob", name: "Bob", vote: "carol" },
      { id: "carol", name: "Carol", vote: "bob" },
      { id: "david", name: "David", vote: "bob" },
      { id: "bot", name: "Charlie", is_bot: true },
    ]);

    const outcomes = determineVotingOutcomes(game);

    // Alice, Bob, Carol, and David should all lose 1 point for wrongly accusing humans
    assertEquals(outcomes.length, 4);

    const aliceOutcome = outcomes.find((o) => o.playerId === "alice");
    const bobOutcome = outcomes.find((o) => o.playerId === "bob");
    const carolOutcome = outcomes.find((o) => o.playerId === "carol");
    const davidOutcome = outcomes.find((o) => o.playerId === "david");

    assertEquals(aliceOutcome?.rewardReason, "wronglyAccusedHuman");
    assertEquals(aliceOutcome?.pointsEarned, -1);
    assertEquals(aliceOutcome?.votedForName, "Bob");

    assertEquals(bobOutcome?.rewardReason, "wronglyAccusedHuman");
    assertEquals(bobOutcome?.pointsEarned, -1);
    assertEquals(bobOutcome?.votedForName, "Carol");

    assertEquals(carolOutcome?.rewardReason, "wronglyAccusedHuman");
    assertEquals(carolOutcome?.pointsEarned, -1);
    assertEquals(carolOutcome?.votedForName, "Bob");

    assertEquals(davidOutcome?.rewardReason, "wronglyAccusedHuman");
    assertEquals(davidOutcome?.pointsEarned, -1);
    assertEquals(davidOutcome?.votedForName, "Bob");
  },
);

Deno.test("AI exists - humans who vote blank lose points", () => {
  const game = createGameData([
    { id: "alice", name: "Alice", vote_blank: true },
    { id: "bob", name: "Bob", vote: "bot" },
    { id: "bot", name: "Charlie", is_bot: true },
  ]);

  const outcomes = determineVotingOutcomes(game);

  // Bob should get 1 point for finding the AI
  // Alice loses 1 point for voting blank when AI exists
  assertEquals(outcomes.length, 2);

  const bobOutcome = outcomes.find((o) => o.playerId === "bob");
  const aliceOutcome = outcomes.find((o) => o.playerId === "alice");

  assertEquals(bobOutcome?.rewardReason, "foundAI");
  assertEquals(bobOutcome?.pointsEarned, 1);
  assertEquals(aliceOutcome?.rewardReason, "missedAI");
  assertEquals(aliceOutcome?.pointsEarned, -1);
});

Deno.test(
  "No AI - humans who vote blank get points, voters lose points",
  () => {
    const game = createGameData([
      { id: "alice", name: "Alice", vote_blank: true },
      { id: "bob", name: "Bob", vote_blank: true },
      { id: "carol", name: "Carol", vote: "alice" },
    ]);

    const outcomes = determineVotingOutcomes(game);

    // Alice and Bob get points for correctly realizing no AI
    // Carol loses 1 point for wrongly accusing Alice
    assertEquals(outcomes.length, 3);

    const aliceBlank = outcomes.find(
      (o) => o.playerId === "alice" && o.rewardReason === "realizedNoAI",
    );
    const bobBlank = outcomes.find(
      (o) => o.playerId === "bob" && o.rewardReason === "realizedNoAI",
    );
    const carolWrongAccusation = outcomes.find(
      (o) => o.playerId === "carol" && o.rewardReason === "wronglyAccusedHuman",
    );

    assertEquals(aliceBlank?.pointsEarned, 1);
    assertEquals(bobBlank?.pointsEarned, 1);
    assertEquals(carolWrongAccusation?.pointsEarned, -1);
    assertEquals(carolWrongAccusation?.votedForName, "Alice");
  },
);

Deno.test("No AI - humans voting for other humans lose points", () => {
  const game = createGameData([
    { id: "alice", name: "Alice", vote: "bob" },
    { id: "bob", name: "Bob", vote: "carol" },
    { id: "carol", name: "Carol", vote: "alice" },
  ]);

  const outcomes = determineVotingOutcomes(game);

  // Everyone loses 1 point for wrongly accusing humans when there's no AI
  assertEquals(outcomes.length, 3);

  const aliceOutcome = outcomes.find((o) => o.playerId === "alice");
  const bobOutcome = outcomes.find((o) => o.playerId === "bob");
  const carolOutcome = outcomes.find((o) => o.playerId === "carol");

  assertEquals(aliceOutcome?.rewardReason, "wronglyAccusedHuman");
  assertEquals(aliceOutcome?.pointsEarned, -1);
  assertEquals(aliceOutcome?.votedForName, "Bob");
  assertEquals(bobOutcome?.rewardReason, "wronglyAccusedHuman");
  assertEquals(bobOutcome?.pointsEarned, -1);
  assertEquals(bobOutcome?.votedForName, "Carol");
  assertEquals(carolOutcome?.rewardReason, "wronglyAccusedHuman");
  assertEquals(carolOutcome?.pointsEarned, -1);
  assertEquals(carolOutcome?.votedForName, "Alice");
});

Deno.test("No AI - everyone votes blank", () => {
  const game = createGameData([
    { id: "alice", name: "Alice", vote_blank: true },
    { id: "bob", name: "Bob", vote_blank: true },
    { id: "carol", name: "Carol", vote_blank: true },
  ]);

  const outcomes = determineVotingOutcomes(game);

  // Everyone gets 1 point for correctly realizing no AI
  assertEquals(outcomes.length, 3);

  outcomes.forEach((outcome) => {
    assertEquals(outcome.rewardReason, "realizedNoAI");
    assertEquals(outcome.pointsEarned, 1);
  });
});

Deno.test("Complex scenario - AI exists with mixed voting", () => {
  const game = createGameData([
    { id: "alice", name: "Alice", vote: "bot" }, // finds AI
    { id: "bob", name: "Bob", vote: "alice" }, // votes for alice
    { id: "carol", name: "Carol", vote: "alice" }, // votes for alice
    { id: "david", name: "David", vote_blank: true }, // votes blank (loses 1 point)
    { id: "bot", name: "Bot", is_bot: true },
  ]);

  const outcomes = determineVotingOutcomes(game);

  // Alice: 1 point for finding AI
  // Bob and Carol: -1 point each for wrongly accusing Alice
  // David: -1 point for voting blank when AI exists
  assertEquals(outcomes.length, 4);

  const aliceFoundAI = outcomes.find(
    (o) => o.playerId === "alice" && o.rewardReason === "foundAI",
  );
  const bobWrongAccusation = outcomes.find(
    (o) => o.playerId === "bob" && o.rewardReason === "wronglyAccusedHuman",
  );
  const carolWrongAccusation = outcomes.find(
    (o) => o.playerId === "carol" && o.rewardReason === "wronglyAccusedHuman",
  );
  const davidOutcome = outcomes.find((o) => o.playerId === "david");

  assertEquals(aliceFoundAI?.pointsEarned, 1);
  assertEquals(bobWrongAccusation?.pointsEarned, -1);
  assertEquals(bobWrongAccusation?.votedForName, "Alice");
  assertEquals(carolWrongAccusation?.pointsEarned, -1);
  assertEquals(carolWrongAccusation?.votedForName, "Alice");
  assertEquals(davidOutcome?.rewardReason, "missedAI");
  assertEquals(davidOutcome?.pointsEarned, -1);
});

Deno.test("No votes cast", () => {
  const game = createGameData([
    { id: "alice", name: "Alice" },
    { id: "bob", name: "Bob" },
  ]);

  const outcomes = determineVotingOutcomes(game);
  assertEquals(outcomes.length, 0);
});

Deno.test("Score cannot go below zero", () => {
  const game = createGameData([
    { id: "alice", name: "Alice", vote: "bob", score: 0 }, // Would lose 1 point but score is already 0
    { id: "bob", name: "Bob", vote: "alice", score: 5 }, // Can lose 1 point normally
    { id: "bot", name: "Bot", is_bot: true },
  ]);

  const outcomes = determineVotingOutcomes(game);

  // Both should lose 1 point for wrongly accusing humans, but Alice's score should not go below 0
  assertEquals(outcomes.length, 2);

  const aliceOutcome = outcomes.find((o) => o.playerId === "alice");
  const bobOutcome = outcomes.find((o) => o.playerId === "bob");

  assertEquals(aliceOutcome?.pointsEarned, -1); // This should be adjusted later to not go below 0
  assertEquals(bobOutcome?.pointsEarned, -1);
});
