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

Deno.test("AI exists - humans who vote for AI get points", () => {
  const game = createGameData([
    { id: "alice", name: "Alice", vote: "bot" },
    { id: "bob", name: "Bob", vote: "bot" },
    { id: "carol", name: "Carol", vote: "alice" },
    { id: "bot", name: "Charlie", is_bot: true },
  ]);

  const outcomes = determineVotingOutcomes(game);

  // Alice and Bob should each get 1 point for finding the AI
  // Alice should get 1 point for being voted for by Carol
  assertEquals(outcomes.length, 3);

  const aliceFoundAI = outcomes.find(
    (o) => o.playerId === "alice" && o.rewardReason === "foundAI",
  );
  const aliceConvinced = outcomes.find(
    (o) => o.playerId === "alice" && o.rewardReason === "convincedVoter",
  );
  const bobFoundAI = outcomes.find(
    (o) => o.playerId === "bob" && o.rewardReason === "foundAI",
  );

  assertEquals(aliceFoundAI?.pointsEarned, 1);
  assertEquals(aliceConvinced?.pointsEarned, 1);
  assertEquals(bobFoundAI?.pointsEarned, 1);
});

Deno.test(
  "AI exists - humans who vote for humans give points to voted player",
  () => {
    const game = createGameData([
      { id: "alice", name: "Alice", vote: "bob" },
      { id: "bob", name: "Bob", vote: "carol" },
      { id: "carol", name: "Carol", vote: "alice" },
      { id: "bot", name: "Charlie", is_bot: true },
    ]);

    const outcomes = determineVotingOutcomes(game);

    // Alice, Bob, and Carol should each get 1 point for being voted for
    // No one found the AI, so no foundAI points
    assertEquals(outcomes.length, 3);

    const aliceOutcome = outcomes.find((o) => o.playerId === "alice");
    const bobOutcome = outcomes.find((o) => o.playerId === "bob");
    const carolOutcome = outcomes.find((o) => o.playerId === "carol");

    assertEquals(aliceOutcome?.rewardReason, "convincedVoter");
    assertEquals(aliceOutcome?.pointsEarned, 1);
    assertEquals(aliceOutcome?.votedForName, "Carol");
    assertEquals(bobOutcome?.rewardReason, "convincedVoter");
    assertEquals(bobOutcome?.pointsEarned, 1);
    assertEquals(bobOutcome?.votedForName, "Alice");
    assertEquals(carolOutcome?.rewardReason, "convincedVoter");
    assertEquals(carolOutcome?.pointsEarned, 1);
    assertEquals(carolOutcome?.votedForName, "Bob");
  },
);

Deno.test(
  "AI exists - multiple humans vote for same human (multiple points)",
  () => {
    const game = createGameData([
      { id: "alice", name: "Alice", vote: "bob" },
      { id: "bob", name: "Bob", vote: "carol" },
      { id: "carol", name: "Carol", vote: "bob" },
      { id: "david", name: "David", vote: "bob" },
      { id: "bot", name: "Charlie", is_bot: true },
    ]);

    const outcomes = determineVotingOutcomes(game);

    // Bob should get 3 points (voted by Alice, Carol, and David)
    // Carol should get 1 point (voted by Bob)
    assertEquals(outcomes.length, 4);

    const bobOutcomes = outcomes.filter((o) => o.playerId === "bob");
    const carolOutcome = outcomes.find((o) => o.playerId === "carol");

    assertEquals(bobOutcomes.length, 3);
    const bobVotedByAlice = bobOutcomes.find((o) => o.votedForName === "Alice");
    const bobVotedByCarol = bobOutcomes.find((o) => o.votedForName === "Carol");
    const bobVotedByDavid = bobOutcomes.find((o) => o.votedForName === "David");

    assertEquals(bobVotedByAlice?.pointsEarned, 1);
    assertEquals(bobVotedByCarol?.pointsEarned, 1);
    assertEquals(bobVotedByDavid?.pointsEarned, 1);

    assertEquals(carolOutcome?.rewardReason, "convincedVoter");
    assertEquals(carolOutcome?.pointsEarned, 1);
    assertEquals(carolOutcome?.votedForName, "Bob");
  },
);

Deno.test("AI exists - humans who vote blank get no points", () => {
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

Deno.test("No AI - humans who vote blank get points", () => {
  const game = createGameData([
    { id: "alice", name: "Alice", vote_blank: true },
    { id: "bob", name: "Bob", vote_blank: true },
    { id: "carol", name: "Carol", vote: "alice" },
  ]);

  const outcomes = determineVotingOutcomes(game);

  // Alice and Bob get points for correctly realizing no AI
  // Alice gets additional point for being voted for by Carol
  assertEquals(outcomes.length, 3);

  const aliceBlank = outcomes.find(
    (o) => o.playerId === "alice" && o.rewardReason === "realizedNoAI",
  );
  const aliceConvinced = outcomes.find(
    (o) => o.playerId === "alice" && o.rewardReason === "convincedVoter",
  );
  const bobBlank = outcomes.find(
    (o) => o.playerId === "bob" && o.rewardReason === "realizedNoAI",
  );

  assertEquals(aliceBlank?.pointsEarned, 1);
  assertEquals(aliceConvinced?.pointsEarned, 1);
  assertEquals(bobBlank?.pointsEarned, 1);
});

Deno.test(
  "No AI - humans voting for other humans give points to voted players",
  () => {
    const game = createGameData([
      { id: "alice", name: "Alice", vote: "bob" },
      { id: "bob", name: "Bob", vote: "carol" },
      { id: "carol", name: "Carol", vote: "alice" },
    ]);

    const outcomes = determineVotingOutcomes(game);

    // Everyone gets 1 point for being voted for
    assertEquals(outcomes.length, 3);

    const aliceOutcome = outcomes.find((o) => o.playerId === "alice");
    const bobOutcome = outcomes.find((o) => o.playerId === "bob");
    const carolOutcome = outcomes.find((o) => o.playerId === "carol");

    assertEquals(aliceOutcome?.rewardReason, "convincedVoter");
    assertEquals(aliceOutcome?.votedForName, "Carol");
    assertEquals(bobOutcome?.rewardReason, "convincedVoter");
    assertEquals(bobOutcome?.votedForName, "Alice");
    assertEquals(carolOutcome?.rewardReason, "convincedVoter");
    assertEquals(carolOutcome?.votedForName, "Bob");
  },
);

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
    { id: "david", name: "David", vote_blank: true }, // votes blank (gets 0 points)
    { id: "bot", name: "Bot", is_bot: true },
  ]);

  const outcomes = determineVotingOutcomes(game);

  // Alice: 1 point for finding AI + 2 points for being voted for by Bob and Carol = 3 total
  // David gets 0 points for voting blank when AI exists (but still gets an outcome)
  assertEquals(outcomes.length, 4);

  const aliceFoundAI = outcomes.find(
    (o) => o.playerId === "alice" && o.rewardReason === "foundAI",
  );
  const aliceConvinced = outcomes.filter(
    (o) => o.playerId === "alice" && o.rewardReason === "convincedVoter",
  );
  const davidOutcome = outcomes.find((o) => o.playerId === "david");

  assertEquals(aliceFoundAI?.pointsEarned, 1);
  assertEquals(aliceConvinced.length, 2);
  aliceConvinced.forEach((outcome) => {
    assertEquals(outcome.pointsEarned, 1);
  });
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
