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

  // Find outcomes by type, regardless of order
  const foundAIOutcomes = outcomes.filter((o) => o.rewardReason === "foundAI");
  const wrongAccusationOutcomes = outcomes.filter(
    (o) => o.rewardReason === "wronglyAccusedHuman",
  );
  const mostVotedOutcomes = outcomes.filter(
    (o) => o.rewardReason === "mostVotedHuman",
  );

  // Verify foundAI outcomes
  assertEquals(foundAIOutcomes.length, 2);
  assertEquals(
    foundAIOutcomes.every((o) => o.pointsEarned === 1),
    true,
  );
  assertEquals(foundAIOutcomes.map((o) => o.playerId).sort(), ["alice", "bob"]);

  // Verify wrongAccusation outcome
  assertEquals(wrongAccusationOutcomes.length, 1);
  assertEquals(wrongAccusationOutcomes[0].playerId, "carol");
  assertEquals(wrongAccusationOutcomes[0].pointsEarned, 0);
  assertEquals(wrongAccusationOutcomes[0].votedForName, "Alice");

  // Verify mostVoted outcome
  assertEquals(mostVotedOutcomes.length, 1);
  assertEquals(mostVotedOutcomes[0].playerId, "alice");
  assertEquals(mostVotedOutcomes[0].pointsEarned, 1);
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

  const wrongAccusationOutcomes = outcomes.filter(
    (o) => o.rewardReason === "wronglyAccusedHuman",
  );
  const mostVotedOutcomes = outcomes.filter(
    (o) => o.rewardReason === "mostVotedHuman",
  );
  const invisibleAIOutcomes = outcomes.filter(
    (o) => o.rewardReason === "invisibleAI",
  );

  // Verify wrong accusation outcomes
  assertEquals(wrongAccusationOutcomes.length, 3);
  assertEquals(
    wrongAccusationOutcomes.every((o) => o.pointsEarned === 0),
    true,
  );

  const aliceWrong = wrongAccusationOutcomes.find(
    (o) => o.playerId === "alice",
  );
  const bobWrong = wrongAccusationOutcomes.find((o) => o.playerId === "bob");
  const carolWrong = wrongAccusationOutcomes.find(
    (o) => o.playerId === "carol",
  );

  assertEquals(aliceWrong?.votedForName, "Bob");
  assertEquals(bobWrong?.votedForName, "Carol");
  assertEquals(carolWrong?.votedForName, "Alice");

  // Verify most voted outcomes (3-way tie)
  assertEquals(mostVotedOutcomes.length, 3);
  assertEquals(
    mostVotedOutcomes.every((o) => o.pointsEarned === 1),
    true,
  );
  assertEquals(mostVotedOutcomes.map((o) => o.playerId).sort(), [
    "alice",
    "bob",
    "carol",
  ]);

  // Verify invisible AI outcome
  assertEquals(invisibleAIOutcomes.length, 1);
  assertEquals(invisibleAIOutcomes[0].pointsEarned, 2);
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

    const wrongAccusationOutcomes = outcomes.filter(
      (o) => o.rewardReason === "wronglyAccusedHuman",
    );
    const mostVotedOutcomes = outcomes.filter(
      (o) => o.rewardReason === "mostVotedHuman",
    );
    const invisibleAIOutcomes = outcomes.filter(
      (o) => o.rewardReason === "invisibleAI",
    );

    // Verify wrong accusation outcomes
    assertEquals(wrongAccusationOutcomes.length, 4);
    assertEquals(
      wrongAccusationOutcomes.every((o) => o.pointsEarned === 0),
      true,
    );

    const aliceWrong = wrongAccusationOutcomes.find(
      (o) => o.playerId === "alice",
    );
    const bobWrong = wrongAccusationOutcomes.find((o) => o.playerId === "bob");
    const carolWrong = wrongAccusationOutcomes.find(
      (o) => o.playerId === "carol",
    );
    const davidWrong = wrongAccusationOutcomes.find(
      (o) => o.playerId === "david",
    );

    assertEquals(aliceWrong?.votedForName, "Bob");
    assertEquals(bobWrong?.votedForName, "Carol");
    assertEquals(carolWrong?.votedForName, "Bob");
    assertEquals(davidWrong?.votedForName, "Bob");

    // Verify most voted outcome (Bob gets 3 votes)
    assertEquals(mostVotedOutcomes.length, 1);
    assertEquals(mostVotedOutcomes[0].playerId, "bob");
    assertEquals(mostVotedOutcomes[0].pointsEarned, 1);

    // Verify invisible AI outcome
    assertEquals(invisibleAIOutcomes.length, 1);
    assertEquals(invisibleAIOutcomes[0].pointsEarned, 2);
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

  const foundAIOutcomes = outcomes.filter((o) => o.rewardReason === "foundAI");
  const missedAIOutcomes = outcomes.filter(
    (o) => o.rewardReason === "missedAI",
  );

  assertEquals(foundAIOutcomes.length, 1);
  assertEquals(foundAIOutcomes[0].playerId, "bob");
  assertEquals(foundAIOutcomes[0].pointsEarned, 1);

  assertEquals(missedAIOutcomes.length, 1);
  assertEquals(missedAIOutcomes[0].playerId, "alice");
  assertEquals(missedAIOutcomes[0].pointsEarned, 0);
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

    const realizedNoAIOutcomes = outcomes.filter(
      (o) => o.rewardReason === "realizedNoAI",
    );
    const wrongAccusationOutcomes = outcomes.filter(
      (o) => o.rewardReason === "wronglyAccusedHuman",
    );
    const mostVotedOutcomes = outcomes.filter(
      (o) => o.rewardReason === "mostVotedHuman",
    );

    // Verify realizedNoAI outcomes
    assertEquals(realizedNoAIOutcomes.length, 2);
    assertEquals(
      realizedNoAIOutcomes.every((o) => o.pointsEarned === 1),
      true,
    );
    assertEquals(realizedNoAIOutcomes.map((o) => o.playerId).sort(), [
      "alice",
      "bob",
    ]);

    // Verify wrong accusation outcome
    assertEquals(wrongAccusationOutcomes.length, 1);
    assertEquals(wrongAccusationOutcomes[0].playerId, "carol");
    assertEquals(wrongAccusationOutcomes[0].pointsEarned, 0);
    assertEquals(wrongAccusationOutcomes[0].votedForName, "Alice");

    // Verify most voted outcome
    assertEquals(mostVotedOutcomes.length, 1);
    assertEquals(mostVotedOutcomes[0].playerId, "alice");
    assertEquals(mostVotedOutcomes[0].pointsEarned, 1);
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

  const wrongAccusationOutcomes = outcomes.filter(
    (o) => o.rewardReason === "wronglyAccusedHuman",
  );
  const mostVotedOutcomes = outcomes.filter(
    (o) => o.rewardReason === "mostVotedHuman",
  );

  // Verify wrong accusation outcomes
  assertEquals(wrongAccusationOutcomes.length, 3);
  assertEquals(
    wrongAccusationOutcomes.every((o) => o.pointsEarned === 0),
    true,
  );

  const aliceWrong = wrongAccusationOutcomes.find(
    (o) => o.playerId === "alice",
  );
  const bobWrong = wrongAccusationOutcomes.find((o) => o.playerId === "bob");
  const carolWrong = wrongAccusationOutcomes.find(
    (o) => o.playerId === "carol",
  );

  assertEquals(aliceWrong?.votedForName, "Bob");
  assertEquals(bobWrong?.votedForName, "Carol");
  assertEquals(carolWrong?.votedForName, "Alice");

  // Verify most voted outcomes (3-way tie)
  assertEquals(mostVotedOutcomes.length, 3);
  assertEquals(
    mostVotedOutcomes.every((o) => o.pointsEarned === 1),
    true,
  );
  assertEquals(mostVotedOutcomes.map((o) => o.playerId).sort(), [
    "alice",
    "bob",
    "carol",
  ]);
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

  const foundAIOutcomes = outcomes.filter((o) => o.rewardReason === "foundAI");
  const wrongAccusationOutcomes = outcomes.filter(
    (o) => o.rewardReason === "wronglyAccusedHuman",
  );
  const missedAIOutcomes = outcomes.filter(
    (o) => o.rewardReason === "missedAI",
  );
  const mostVotedOutcomes = outcomes.filter(
    (o) => o.rewardReason === "mostVotedHuman",
  );

  // Verify foundAI outcome
  assertEquals(foundAIOutcomes.length, 1);
  assertEquals(foundAIOutcomes[0].playerId, "alice");
  assertEquals(foundAIOutcomes[0].pointsEarned, 1);

  // Verify wrong accusation outcomes
  assertEquals(wrongAccusationOutcomes.length, 2);
  assertEquals(
    wrongAccusationOutcomes.every((o) => o.pointsEarned === 0),
    true,
  );
  assertEquals(
    wrongAccusationOutcomes.every((o) => o.votedForName === "Alice"),
    true,
  );
  assertEquals(wrongAccusationOutcomes.map((o) => o.playerId).sort(), [
    "bob",
    "carol",
  ]);

  // Verify missedAI outcome
  assertEquals(missedAIOutcomes.length, 1);
  assertEquals(missedAIOutcomes[0].playerId, "david");
  assertEquals(missedAIOutcomes[0].pointsEarned, 0);

  // Verify most voted outcome
  assertEquals(mostVotedOutcomes.length, 1);
  assertEquals(mostVotedOutcomes[0].playerId, "alice");
  assertEquals(mostVotedOutcomes[0].pointsEarned, 1);
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

  const wrongAccusationOutcomes = outcomes.filter(
    (o) => o.rewardReason === "wronglyAccusedHuman",
  );
  const mostVotedOutcomes = outcomes.filter(
    (o) => o.rewardReason === "mostVotedHuman",
  );
  const invisibleAIOutcomes = outcomes.filter(
    (o) => o.rewardReason === "invisibleAI",
  );

  // Verify wrong accusation outcomes
  assertEquals(wrongAccusationOutcomes.length, 2);
  assertEquals(
    wrongAccusationOutcomes.every((o) => o.pointsEarned === 0),
    true,
  );
  assertEquals(wrongAccusationOutcomes.map((o) => o.playerId).sort(), [
    "alice",
    "bob",
  ]);

  // Verify most voted outcomes (tie)
  assertEquals(mostVotedOutcomes.length, 2);
  assertEquals(
    mostVotedOutcomes.every((o) => o.pointsEarned === 1),
    true,
  );
  assertEquals(mostVotedOutcomes.map((o) => o.playerId).sort(), [
    "alice",
    "bob",
  ]);

  // Verify invisible AI outcome
  assertEquals(invisibleAIOutcomes.length, 1);
  assertEquals(invisibleAIOutcomes[0].pointsEarned, 2);
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

  const invisibleAIOutcomes = outcomes.filter(
    (o) => o.rewardReason === "invisibleAI",
  );
  const mostVotedOutcomes = outcomes.filter(
    (o) => o.rewardReason === "mostVotedHuman",
  );
  const wrongAccusationOutcomes = outcomes.filter(
    (o) => o.rewardReason === "wronglyAccusedHuman",
  );

  // Verify invisible AI outcome
  assertEquals(invisibleAIOutcomes.length, 1);
  assertEquals(invisibleAIOutcomes[0].playerId, "ai");
  assertEquals(invisibleAIOutcomes[0].pointsEarned, 2);

  // Verify most voted outcome
  assertEquals(mostVotedOutcomes.length, 1);
  assertEquals(mostVotedOutcomes[0].playerId, "alice");
  assertEquals(mostVotedOutcomes[0].pointsEarned, 1);

  // Verify wrong accusation outcomes
  assertEquals(wrongAccusationOutcomes.length, 3);
  assertEquals(
    wrongAccusationOutcomes.every((o) => o.pointsEarned === 0),
    true,
  );
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

  const foundAIOutcomes = outcomes.filter((o) => o.rewardReason === "foundAI");
  const wrongAccusationOutcomes = outcomes.filter(
    (o) => o.rewardReason === "wronglyAccusedHuman",
  );
  const mostVotedOutcomes = outcomes.filter(
    (o) => o.rewardReason === "mostVotedHuman",
  );
  const invisibleAIOutcomes = outcomes.filter(
    (o) => o.rewardReason === "invisibleAI",
  );

  // Verify foundAI outcomes
  assertEquals(foundAIOutcomes.length, 2);
  assertEquals(
    foundAIOutcomes.every((o) => o.pointsEarned === 1),
    true,
  );
  assertEquals(foundAIOutcomes.map((o) => o.playerId).sort(), ["alice", "bob"]);

  // Verify wrong accusation outcome
  assertEquals(wrongAccusationOutcomes.length, 1);
  assertEquals(wrongAccusationOutcomes[0].playerId, "carol");
  assertEquals(wrongAccusationOutcomes[0].pointsEarned, 0);

  // Verify most voted outcome
  assertEquals(mostVotedOutcomes.length, 1);
  assertEquals(mostVotedOutcomes[0].playerId, "alice");
  assertEquals(mostVotedOutcomes[0].pointsEarned, 1);

  // AI should get no bonus (got votes)
  assertEquals(invisibleAIOutcomes.length, 0);
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

  const wrongAccusationOutcomes = outcomes.filter(
    (o) => o.rewardReason === "wronglyAccusedHuman",
  );
  const mostVotedOutcomes = outcomes.filter(
    (o) => o.rewardReason === "mostVotedHuman",
  );
  const invisibleAIOutcomes = outcomes.filter(
    (o) => o.rewardReason === "invisibleAI",
  );

  // Verify wrong accusation outcomes
  assertEquals(wrongAccusationOutcomes.length, 4);
  assertEquals(
    wrongAccusationOutcomes.every((o) => o.pointsEarned === 0),
    true,
  );

  // Verify most voted outcomes (4-way tie)
  assertEquals(mostVotedOutcomes.length, 4);
  assertEquals(
    mostVotedOutcomes.every((o) => o.pointsEarned === 1),
    true,
  );
  assertEquals(mostVotedOutcomes.map((o) => o.playerId).sort(), [
    "alice",
    "bob",
    "carol",
    "david",
  ]);

  // Verify invisible AI outcome
  assertEquals(invisibleAIOutcomes.length, 1);
  assertEquals(invisibleAIOutcomes[0].playerId, "ai");
  assertEquals(invisibleAIOutcomes[0].pointsEarned, 2);
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

  const wrongAccusationOutcomes = outcomes.filter(
    (o) => o.rewardReason === "wronglyAccusedHuman",
  );
  const mostVotedOutcomes = outcomes.filter(
    (o) => o.rewardReason === "mostVotedHuman",
  );

  // Verify wrong accusation outcomes
  assertEquals(wrongAccusationOutcomes.length, 3);
  assertEquals(
    wrongAccusationOutcomes.every((o) => o.pointsEarned === 0),
    true,
  );

  // Verify most voted outcome
  assertEquals(mostVotedOutcomes.length, 1);
  assertEquals(mostVotedOutcomes[0].playerId, "bob");
  assertEquals(mostVotedOutcomes[0].pointsEarned, 1);
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

  const foundAIOutcomes = outcomes.filter((o) => o.rewardReason === "foundAI");
  const mostVotedOutcomes = outcomes.filter(
    (o) => o.rewardReason === "mostVotedHuman",
  );
  const invisibleAIOutcomes = outcomes.filter(
    (o) => o.rewardReason === "invisibleAI",
  );

  // Verify foundAI outcomes
  assertEquals(foundAIOutcomes.length, 3);
  assertEquals(
    foundAIOutcomes.every((o) => o.pointsEarned === 1),
    true,
  );
  assertEquals(foundAIOutcomes.map((o) => o.playerId).sort(), [
    "alice",
    "bob",
    "carol",
  ]);

  // No most-voted bonuses (no humans got votes)
  assertEquals(mostVotedOutcomes.length, 0);

  // No invisible AI bonus (AI got votes)
  assertEquals(invisibleAIOutcomes.length, 0);
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

  const foundAIOutcomes = outcomes.filter((o) => o.rewardReason === "foundAI");
  const wrongAccusationOutcomes = outcomes.filter(
    (o) => o.rewardReason === "wronglyAccusedHuman",
  );
  const mostVotedOutcomes = outcomes.filter(
    (o) => o.rewardReason === "mostVotedHuman",
  );
  const invisibleAIOutcomes = outcomes.filter(
    (o) => o.rewardReason === "invisibleAI",
  );

  // Verify foundAI outcome
  assertEquals(foundAIOutcomes.length, 1);
  assertEquals(foundAIOutcomes[0].playerId, "alice");
  assertEquals(foundAIOutcomes[0].pointsEarned, 1);

  // Verify wrong accusation outcomes
  assertEquals(wrongAccusationOutcomes.length, 3);
  assertEquals(
    wrongAccusationOutcomes.every((o) => o.pointsEarned === 0),
    true,
  );
  assertEquals(wrongAccusationOutcomes.map((o) => o.playerId).sort(), [
    "bob",
    "carol",
    "david",
  ]);

  // Verify most voted outcome
  assertEquals(mostVotedOutcomes.length, 1);
  assertEquals(mostVotedOutcomes[0].playerId, "carol");
  assertEquals(mostVotedOutcomes[0].pointsEarned, 1);

  // AI got votes, no bonus
  assertEquals(invisibleAIOutcomes.length, 0);
});
