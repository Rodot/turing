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

Deno.test("AI exists - humans who vote for AI get points", () => {
  const game = createGameData([
    { id: "alice", name: "Alice", vote: "bot" },
    { id: "bob", name: "Bob", vote: "bot" },
    { id: "carol", name: "Carol", vote: "alice" },
    { id: "bot", name: "Charlie", is_bot: true },
  ]);

  const outcomes = determineVotingOutcomes(game);

  // Alice and Bob should each get 1 point for finding the AI
  // Carol should get 0 points for wrongly accusing Alice
  // Alice should get +1 for being most voted (1 vote from Carol)
  // AI gets 2 votes so no invisibleAI bonus
  assertEquals(outcomes.length, 4);

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
  assertEquals(carolWrongAccusation?.pointsEarned, 0);
  assertEquals(carolWrongAccusation?.votedForName, "Alice");
});

Deno.test("AI exists - humans who vote for humans get no points", () => {
  const game = createGameData([
    { id: "alice", name: "Alice", vote: "bob" },
    { id: "bob", name: "Bob", vote: "carol" },
    { id: "carol", name: "Carol", vote: "alice" },
    { id: "bot", name: "Charlie", is_bot: true },
  ]);

  const outcomes = determineVotingOutcomes(game);

  // Alice, Bob, and Carol should each get 0 points for wrongly accusing humans
  // No one found the AI
  // Alice, Bob, and Carol each get 1 vote (3-way tie), so all get +1 bonus
  // AI gets zero votes, so +2 bonus
  assertEquals(outcomes.length, 7);

  const aliceOutcome = outcomes.find((o) => o.playerId === "alice");
  const bobOutcome = outcomes.find((o) => o.playerId === "bob");
  const carolOutcome = outcomes.find((o) => o.playerId === "carol");

  assertEquals(aliceOutcome?.rewardReason, "wronglyAccusedHuman");
  assertEquals(aliceOutcome?.pointsEarned, 0);
  assertEquals(aliceOutcome?.votedForName, "Bob");
  assertEquals(bobOutcome?.rewardReason, "wronglyAccusedHuman");
  assertEquals(bobOutcome?.pointsEarned, 0);
  assertEquals(bobOutcome?.votedForName, "Carol");
  assertEquals(carolOutcome?.rewardReason, "wronglyAccusedHuman");
  assertEquals(carolOutcome?.pointsEarned, 0);
  assertEquals(carolOutcome?.votedForName, "Alice");
});

Deno.test(
  "AI exists - multiple humans vote for same human (all get no points)",
  () => {
    const game = createGameData([
      { id: "alice", name: "Alice", vote: "bob" },
      { id: "bob", name: "Bob", vote: "carol" },
      { id: "carol", name: "Carol", vote: "bob" },
      { id: "david", name: "David", vote: "bob" },
      { id: "bot", name: "Charlie", is_bot: true },
    ]);

    const outcomes = determineVotingOutcomes(game);

    // Alice, Bob, Carol, and David should all get 0 points for wrongly accusing humans
    // Bob gets most votes (3 votes), so +1 bonus
    // AI gets zero votes, so +2 bonus
    assertEquals(outcomes.length, 6);

    const aliceOutcome = outcomes.find((o) => o.playerId === "alice");
    const bobOutcome = outcomes.find((o) => o.playerId === "bob");
    const carolOutcome = outcomes.find((o) => o.playerId === "carol");
    const davidOutcome = outcomes.find((o) => o.playerId === "david");

    assertEquals(aliceOutcome?.rewardReason, "wronglyAccusedHuman");
    assertEquals(aliceOutcome?.pointsEarned, 0);
    assertEquals(aliceOutcome?.votedForName, "Bob");

    assertEquals(bobOutcome?.rewardReason, "wronglyAccusedHuman");
    assertEquals(bobOutcome?.pointsEarned, 0);
    assertEquals(bobOutcome?.votedForName, "Carol");

    assertEquals(carolOutcome?.rewardReason, "wronglyAccusedHuman");
    assertEquals(carolOutcome?.pointsEarned, 0);
    assertEquals(carolOutcome?.votedForName, "Bob");

    assertEquals(davidOutcome?.rewardReason, "wronglyAccusedHuman");
    assertEquals(davidOutcome?.pointsEarned, 0);
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
  // Alice gets 0 points for voting blank when AI exists
  assertEquals(outcomes.length, 2);

  const bobOutcome = outcomes.find((o) => o.playerId === "bob");
  const aliceOutcome = outcomes.find((o) => o.playerId === "alice");

  assertEquals(bobOutcome?.rewardReason, "foundAI");
  assertEquals(bobOutcome?.pointsEarned, 1);
  assertEquals(aliceOutcome?.rewardReason, "missedAI");
  assertEquals(aliceOutcome?.pointsEarned, 0);
});

Deno.test(
  "No AI - humans who vote blank get points, voters get no points",
  () => {
    const game = createGameData([
      { id: "alice", name: "Alice", vote_blank: true },
      { id: "bob", name: "Bob", vote_blank: true },
      { id: "carol", name: "Carol", vote: "alice" },
    ]);

    const outcomes = determineVotingOutcomes(game);

    // Alice and Bob get points for correctly realizing no AI
    // Carol gets 0 points for wrongly accusing Alice
    // Alice gets most votes (1 vote), so +1 bonus
    assertEquals(outcomes.length, 4);

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
    assertEquals(carolWrongAccusation?.pointsEarned, 0);
    assertEquals(carolWrongAccusation?.votedForName, "Alice");
  },
);

Deno.test("No AI - humans voting for other humans get no points", () => {
  const game = createGameData([
    { id: "alice", name: "Alice", vote: "bob" },
    { id: "bob", name: "Bob", vote: "carol" },
    { id: "carol", name: "Carol", vote: "alice" },
  ]);

  const outcomes = determineVotingOutcomes(game);

  // Everyone gets 0 points for wrongly accusing humans when there's no AI
  // Everyone gets 1 vote, so all tie for most votes (+1 each)
  assertEquals(outcomes.length, 6);

  const aliceOutcome = outcomes.find((o) => o.playerId === "alice");
  const bobOutcome = outcomes.find((o) => o.playerId === "bob");
  const carolOutcome = outcomes.find((o) => o.playerId === "carol");

  assertEquals(aliceOutcome?.rewardReason, "wronglyAccusedHuman");
  assertEquals(aliceOutcome?.pointsEarned, 0);
  assertEquals(aliceOutcome?.votedForName, "Bob");
  assertEquals(bobOutcome?.rewardReason, "wronglyAccusedHuman");
  assertEquals(bobOutcome?.pointsEarned, 0);
  assertEquals(bobOutcome?.votedForName, "Carol");
  assertEquals(carolOutcome?.rewardReason, "wronglyAccusedHuman");
  assertEquals(carolOutcome?.pointsEarned, 0);
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
  // Bob and Carol: 0 points each for wrongly accusing Alice
  // David: 0 points for voting blank when AI exists
  // Alice gets most votes (2 votes), so +1 bonus
  assertEquals(outcomes.length, 5);

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
  assertEquals(bobWrongAccusation?.pointsEarned, 0);
  assertEquals(bobWrongAccusation?.votedForName, "Alice");
  assertEquals(carolWrongAccusation?.pointsEarned, 0);
  assertEquals(carolWrongAccusation?.votedForName, "Alice");
  assertEquals(davidOutcome?.rewardReason, "missedAI");
  assertEquals(davidOutcome?.pointsEarned, 0);
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

  // Both should get 0 points for wrongly accusing humans
  // Both get 1 vote each, so both get most-voted bonus
  // AI gets zero votes, so gets invisible bonus
  assertEquals(outcomes.length, 5);

  const aliceOutcome = outcomes.find((o) => o.playerId === "alice");
  const bobOutcome = outcomes.find((o) => o.playerId === "bob");

  assertEquals(aliceOutcome?.pointsEarned, 0);
  assertEquals(bobOutcome?.pointsEarned, 0);
});

Deno.test("New bonus scoring - AI gets zero votes", () => {
  const game = createGameData([
    { id: "alice", name: "Alice", vote: "bob" }, // votes for bob
    { id: "bob", name: "Bob", vote: "alice" }, // votes for alice
    { id: "carol", name: "Carol", vote: "alice" }, // votes for alice
    { id: "ai", name: "AI Player", is_bot: true }, // AI gets 0 votes
  ]);

  const outcomes = determineVotingOutcomes(game);

  // Alice should get +1 for most votes (2 votes) + 0 for wrongly accusing bob = multiple outcomes
  // Bob should get 0 for wrongly accusing alice
  // Carol should get 0 for wrongly accusing alice
  // AI should get +2 for getting zero votes

  const aiOutcome = outcomes.find(
    (o) => o.playerId === "ai" && o.rewardReason === "invisibleAI",
  );
  const aliceMostVoted = outcomes.find(
    (o) => o.playerId === "alice" && o.rewardReason === "mostVotedHuman",
  );

  assertEquals(aiOutcome?.pointsEarned, 2);
  assertEquals(aliceMostVoted?.pointsEarned, 1);
});

Deno.test("New bonus scoring - AI gets votes (no bonus)", () => {
  const game = createGameData([
    { id: "alice", name: "Alice", vote: "ai" }, // finds AI
    { id: "bob", name: "Bob", vote: "ai" }, // finds AI
    { id: "carol", name: "Carol", vote: "alice" }, // votes for alice
    { id: "ai", name: "AI Player", is_bot: true }, // AI gets 2 votes
  ]);

  const outcomes = determineVotingOutcomes(game);

  // Alice should get +1 for finding AI
  // Bob should get +1 for finding AI
  // Carol should get 0 for wrongly accusing alice
  // AI should get NO bonus (got votes)

  const aiOutcome = outcomes.find(
    (o) => o.playerId === "ai" && o.rewardReason === "invisibleAI",
  );
  const aliceMostVoted = outcomes.find(
    (o) => o.playerId === "alice" && o.rewardReason === "mostVotedHuman",
  );

  assertEquals(aiOutcome, undefined); // AI should get no bonus
  assertEquals(aliceMostVoted?.pointsEarned, 1); // Alice gets most votes bonus
});

Deno.test("New bonus scoring - Multiple humans tie for most votes", () => {
  const game = createGameData([
    { id: "alice", name: "Alice", vote: "bob" }, // votes for bob
    { id: "bob", name: "Bob", vote: "alice" }, // votes for alice
    { id: "carol", name: "Carol", vote: "david" }, // votes for david
    { id: "david", name: "David", vote: "carol" }, // votes for carol
    { id: "ai", name: "AI Player", is_bot: true }, // AI gets 0 votes
  ]);

  const outcomes = determineVotingOutcomes(game);

  // Everyone should get 1 vote each, so all humans should get most-votes bonus
  // AI should get invisible bonus

  const aliceMostVoted = outcomes.find(
    (o) => o.playerId === "alice" && o.rewardReason === "mostVotedHuman",
  );
  const bobMostVoted = outcomes.find(
    (o) => o.playerId === "bob" && o.rewardReason === "mostVotedHuman",
  );
  const carolMostVoted = outcomes.find(
    (o) => o.playerId === "carol" && o.rewardReason === "mostVotedHuman",
  );
  const davidMostVoted = outcomes.find(
    (o) => o.playerId === "david" && o.rewardReason === "mostVotedHuman",
  );
  const aiInvisible = outcomes.find(
    (o) => o.playerId === "ai" && o.rewardReason === "invisibleAI",
  );

  assertEquals(aliceMostVoted?.pointsEarned, 1);
  assertEquals(bobMostVoted?.pointsEarned, 1);
  assertEquals(carolMostVoted?.pointsEarned, 1);
  assertEquals(davidMostVoted?.pointsEarned, 1);
  assertEquals(aiInvisible?.pointsEarned, 2);
});

Deno.test("New bonus scoring - No AI scenario with most voted human", () => {
  const game = createGameData([
    { id: "alice", name: "Alice", vote: "bob" }, // votes for bob
    { id: "bob", name: "Bob", vote: "carol" }, // votes for carol
    { id: "carol", name: "Carol", vote: "bob" }, // votes for bob
  ]);

  const outcomes = determineVotingOutcomes(game);

  // Bob gets 2 votes, should get most-voted bonus
  // Others get wrongly accused outcomes

  const bobMostVoted = outcomes.find(
    (o) => o.playerId === "bob" && o.rewardReason === "mostVotedHuman",
  );

  assertEquals(bobMostVoted?.pointsEarned, 1);
});

Deno.test("New bonus scoring - Everyone votes for AI (no human votes)", () => {
  const game = createGameData([
    { id: "alice", name: "Alice", vote: "ai" }, // finds AI
    { id: "bob", name: "Bob", vote: "ai" }, // finds AI
    { id: "carol", name: "Carol", vote: "ai" }, // finds AI
    { id: "ai", name: "AI Player", is_bot: true }, // AI gets all votes
  ]);

  const outcomes = determineVotingOutcomes(game);

  // All humans find AI (+1 each)
  // No human gets votes, so no most-voted bonus
  // AI gets votes, so no invisible bonus

  const mostVotedOutcomes = outcomes.filter(
    (o) => o.rewardReason === "mostVotedHuman",
  );
  const invisibleAiOutcome = outcomes.find(
    (o) => o.rewardReason === "invisibleAI",
  );

  assertEquals(mostVotedOutcomes.length, 0); // No most-voted bonuses
  assertEquals(invisibleAiOutcome, undefined); // No invisible AI bonus
});

Deno.test("New bonus scoring - Complex scenario with all bonuses", () => {
  const game = createGameData([
    { id: "alice", name: "Alice", vote: "ai" }, // finds AI (+1)
    { id: "bob", name: "Bob", vote: "carol" }, // votes for carol (0)
    { id: "carol", name: "Carol", vote: "carol" }, // votes for herself (0)
    { id: "david", name: "David", vote: "carol" }, // votes for carol (0)
    { id: "ai", name: "AI Player", is_bot: true }, // gets 1 vote (no bonus)
  ]);

  const outcomes = determineVotingOutcomes(game);

  // Alice: +1 for finding AI
  // Bob, Carol, David: 0 for wrongly accusing humans
  // Carol: +1 for getting most votes (2 votes)
  // AI: no bonus (got 1 vote)

  const aliceFoundAi = outcomes.find(
    (o) => o.playerId === "alice" && o.rewardReason === "foundAI",
  );
  const carolMostVoted = outcomes.find(
    (o) => o.playerId === "carol" && o.rewardReason === "mostVotedHuman",
  );
  const aiInvisible = outcomes.find((o) => o.rewardReason === "invisibleAI");

  assertEquals(aliceFoundAi?.pointsEarned, 1);
  assertEquals(carolMostVoted?.pointsEarned, 1);
  assertEquals(aiInvisible, undefined); // AI got votes, no bonus
});
