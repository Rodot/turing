import {
  assertEquals,
  assertNotEquals,
} from "https://deno.land/std@0.190.0/testing/asserts.ts";
import { selectNextBot } from "./select-next-bot.ts";
import { MessageData, PlayerData } from "../_types/Database.type.ts";

// Test data
const players: PlayerData[] = [
  {
    id: "player1",
    name: "Alice",
    vote: null,
    vote_blank: false,
    is_bot: false,
    score: 0,
  },
  {
    id: "player2",
    name: "Bob",
    vote: null,
    vote_blank: false,
    is_bot: false,
    score: 0,
  },
  {
    id: "player3",
    name: "Carol",
    vote: null,
    vote_blank: false,
    is_bot: false,
    score: 0,
  },
];

const twoPlayers: PlayerData[] = [
  {
    id: "player1",
    name: "Alice",
    vote: null,
    vote_blank: false,
    is_bot: false,
    score: 0,
  },
  {
    id: "player2",
    name: "Bob",
    vote: null,
    vote_blank: false,
    is_bot: false,
    score: 0,
  },
];

function createBotPickedMessage(content: string): MessageData {
  return {
    id: "msg1",
    profile_id: "system",
    game_id: "game1",
    author_name: "",
    type: "bot_picked",
    content,
  };
}

// Mock Math.random for deterministic tests
function withMockedRandom<T>(value: number, fn: () => T): T {
  const originalRandom = Math.random;
  Math.random = () => value;
  try {
    return fn();
  } finally {
    Math.random = originalRandom;
  }
}

Deno.test("selectNextBot - first round always picks a bot", () => {
  // No bot_picked messages = first round
  const messages: MessageData[] = [];

  // Run 1000 times to ensure it's deterministic
  for (let i = 0; i < 1000; i++) {
    const result = selectNextBot(messages, players);
    assertNotEquals(result, null, "First round should always pick a bot");
    assertEquals(players.includes(result!), true, "Should pick a valid player");
  }
});

Deno.test("selectNextBot - player can't be picked twice in a row", () => {
  // Previous round had player1 as bot
  const messages = [createBotPickedMessage("player1")];

  // Run 1000 times to ensure player1 is never picked
  for (let i = 0; i < 1000; i++) {
    const result = selectNextBot(messages, players);
    if (result !== null) {
      assertNotEquals(
        result.id,
        "player1",
        "Same player can't be picked twice in a row",
      );
    }
  }
});

Deno.test("selectNextBot - can't have two rounds without bot", () => {
  // Previous round had no bot
  const messages = [createBotPickedMessage("none")];

  // Run 1000 times to ensure a bot is always picked
  for (let i = 0; i < 1000; i++) {
    const result = selectNextBot(messages, players);
    assertNotEquals(result, null, "Can't have two rounds without bot");
    assertEquals(players.includes(result!), true, "Should pick a valid player");
  }
});

Deno.test("selectNextBot - deterministic behavior with mocked random", () => {
  // Previous round had player2 as bot
  const messages = [createBotPickedMessage("player2")];

  // Mock random to always trigger no-bot (probability = 1)
  withMockedRandom(0, () => {
    const result = selectNextBot(messages, players);
    assertEquals(result, null, "Should return null when random <= 1/(n+1)");
  });

  // Mock random to never trigger no-bot (probability = 0)
  withMockedRandom(0.99, () => {
    const result = selectNextBot(messages, players);
    assertNotEquals(
      result,
      null,
      "Should return a player when random > 1/(n+1)",
    );
    assertNotEquals(result!.id, "player2", "Should not pick the same player");
  });
});

Deno.test("selectNextBot - statistical probability distribution", () => {
  // Previous round had player1 as bot, so no-bot probability should be 1/(3+1) = 0.25
  const messages = [createBotPickedMessage("player1")];
  const iterations = 10000;
  let noBotCount = 0;

  for (let i = 0; i < iterations; i++) {
    const result = selectNextBot(messages, players);
    if (result === null) {
      noBotCount++;
    } else {
      // Ensure the same player is never picked
      assertNotEquals(
        result.id,
        "player1",
        "Same player can't be picked twice",
      );
    }
  }

  const noBotProbability = noBotCount / iterations;
  const expectedProbability = 1 / (players.length + 1); // 0.25
  const tolerance = 0.03; // 3% tolerance for statistical variance

  console.log(
    `No-bot probability: ${noBotProbability}, expected: ${expectedProbability}`,
  );

  assertEquals(
    Math.abs(noBotProbability - expectedProbability) < tolerance,
    true,
    `Probability should be ~${expectedProbability} ± ${tolerance}, got ${noBotProbability}`,
  );
});

Deno.test("selectNextBot - statistical probability with 2 players", () => {
  // Previous round had player1 as bot, so no-bot probability should be 1/(2+1) = 0.33
  const messages = [createBotPickedMessage("player1")];
  const iterations = 10000;
  let noBotCount = 0;
  let player2Count = 0;

  for (let i = 0; i < iterations; i++) {
    const result = selectNextBot(messages, twoPlayers);
    if (result === null) {
      noBotCount++;
    } else {
      assertNotEquals(
        result.id,
        "player1",
        "Same player can't be picked twice",
      );
      if (result.id === "player2") {
        player2Count++;
      }
    }
  }

  const noBotProbability = noBotCount / iterations;
  const player2Probability = player2Count / iterations;
  const expectedNoBotProbability = 1 / (twoPlayers.length + 1); // ~0.33
  const expectedPlayer2Probability = 2 / (twoPlayers.length + 1); // ~0.67
  const tolerance = 0.03;

  console.log(`No-bot: ${noBotProbability}, Player2: ${player2Probability}`);
  console.log(
    `Expected no-bot: ${expectedNoBotProbability}, Player2: ${expectedPlayer2Probability}`,
  );

  assertEquals(
    Math.abs(noBotProbability - expectedNoBotProbability) < tolerance,
    true,
    `No-bot probability should be ~${expectedNoBotProbability} ± ${tolerance}`,
  );

  assertEquals(
    Math.abs(player2Probability - expectedPlayer2Probability) < tolerance,
    true,
    `Player2 probability should be ~${expectedPlayer2Probability} ± ${tolerance}`,
  );
});

Deno.test("selectNextBot - multiple rounds history", () => {
  // Simulate multiple rounds: player1 -> none -> player2
  const messages = [
    createBotPickedMessage("player1"),
    createBotPickedMessage("none"),
    createBotPickedMessage("player2"),
  ];

  // Should not pick player2 (last bot) and should always pick someone (can't have two "none" in a row after a bot)
  for (let i = 0; i < 1000; i++) {
    const result = selectNextBot(messages, players);
    if (result !== null) {
      assertNotEquals(result.id, "player2", "Should not pick the last bot");
    }
    // Note: Could be null due to probability, that's fine since last wasn't "none"
  }
});

Deno.test("selectNextBot - edge case with single player", () => {
  const singlePlayer = [players[0]];
  const messages = [createBotPickedMessage("player1")];

  // With only one player who was the last bot, should return null
  // (no available players after filtering)
  const result = selectNextBot(messages, singlePlayer);
  assertEquals(result, null, "Should return null when no available players");
});

Deno.test("selectNextBot - edge case with empty players", () => {
  const messages: MessageData[] = [];
  const emptyPlayers: PlayerData[] = [];

  const result = selectNextBot(messages, emptyPlayers);
  assertEquals(result, null, "Should return null with empty players");
});

Deno.test("selectNextBot - property: result is always valid or null", () => {
  const testCases = [
    { messages: [], players },
    { messages: [createBotPickedMessage("player1")], players },
    { messages: [createBotPickedMessage("none")], players },
    { messages: [createBotPickedMessage("player2")], players: twoPlayers },
  ];

  for (const testCase of testCases) {
    for (let i = 0; i < 100; i++) {
      const result = selectNextBot(testCase.messages, testCase.players);

      if (result !== null) {
        // Result should be a valid player
        assertEquals(
          testCase.players.includes(result),
          true,
          "Result should be a valid player from the input",
        );
      }
      // null is also a valid result
    }
  }
});
