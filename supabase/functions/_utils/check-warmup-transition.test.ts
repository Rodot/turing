import { assertEquals } from "std/assert/mod.ts";
import { checkWarmupTransition } from "./check-warmup-transition.ts";
import type { GameData, MessageData } from "../_types/Database.type.ts";

// Helper function to create test game data
function createGameData(
  players: Array<{
    id: string;
    name: string;
    is_bot?: boolean;
    score?: number;
  }>,
): GameData {
  return {
    id: "test-game-id",
    status: "talking_warmup",
    lang: "en",
    last_bot_id: null,
    players: players.map((p) => ({
      id: p.id,
      name: p.name,
      is_bot: p.is_bot || false,
      vote: null,
      vote_blank: false,
      score: p.score || 0,
    })),
  };
}

// Helper function to create test message
function createMessage(
  id: string,
  profile_id: string,
  content: string,
  type: "user" | "status" | "system" | "icebreaker" = "user",
): MessageData {
  return {
    id,
    profile_id,
    game_id: "test-game-id",
    author_name: `User${profile_id}`,
    type,
    content,
  };
}

Deno.test("checkWarmupTransition - no warmup status message", () => {
  const game = createGameData([
    { id: "player1", name: "Alice" },
    { id: "player2", name: "Bob" },
  ]);

  const messages: MessageData[] = [
    createMessage("1", "player1", "Hello"),
    createMessage("2", "player2", "Hi there"),
    createMessage("3", "player1", "How are you?"),
  ];

  const result = checkWarmupTransition(game, messages);

  assertEquals(result, false);
});

Deno.test(
  "checkWarmupTransition - not enough total messages (need 3x players)",
  () => {
    const game = createGameData([
      { id: "player1", name: "Alice" },
      { id: "player2", name: "Bob" },
    ]);

    const messages: MessageData[] = [
      createMessage("1", "system", "talking_warmup", "status"),
      createMessage("2", "player1", "Hello"),
      createMessage("3", "player1", "How are you?"),
      createMessage("4", "player2", "Hi there"), // Only 3 messages, need 6 (3 × 2 players)
      createMessage("5", "player1", "Another message"),
    ];

    const result = checkWarmupTransition(game, messages);

    assertEquals(result, false);
  },
);

Deno.test("checkWarmupTransition - enough total messages (3x players)", () => {
  const game = createGameData([
    { id: "player1", name: "Alice" },
    { id: "player2", name: "Bob" },
  ]);

  const messages: MessageData[] = [
    createMessage("1", "system", "talking_warmup", "status"),
    createMessage("2", "player1", "Hello"),
    createMessage("3", "player1", "How are you?"),
    createMessage("4", "player2", "Hi there"),
    createMessage("5", "player2", "I'm good"),
    createMessage("6", "player1", "Great!"),
    createMessage("7", "player2", "Perfect!"), // 6 messages total = 3 × 2 players
  ];

  const result = checkWarmupTransition(game, messages);

  assertEquals(result, true);
});

Deno.test(
  "checkWarmupTransition - new message pushes total over threshold",
  () => {
    const game = createGameData([
      { id: "player1", name: "Alice" },
      { id: "player2", name: "Bob" },
    ]);

    const messages: MessageData[] = [
      createMessage("1", "system", "talking_warmup", "status"),
      createMessage("2", "player1", "Hello"),
      createMessage("3", "player1", "How are you?"),
      createMessage("4", "player2", "Hi there"),
      createMessage("5", "player2", "I'm good"),
      createMessage("6", "player1", "Great!"),
      createMessage("7", "player2", "Perfect!"), // 6th user message reaches 3 × 2 = 6 threshold
    ];

    const result = checkWarmupTransition(game, messages);

    assertEquals(result, true);
  },
);

Deno.test("checkWarmupTransition - ignores non-user messages", () => {
  const game = createGameData([
    { id: "player1", name: "Alice" },
    { id: "player2", name: "Bob" },
  ]);

  const messages: MessageData[] = [
    createMessage("1", "system", "talking_warmup", "status"),
    createMessage("2", "player1", "Hello"),
    createMessage("3", "system", "System message", "system"),
    createMessage("4", "player1", "How are you?"),
    createMessage("5", "player2", "Hi there"),
    createMessage("6", "system", "Another system message", "system"),
    createMessage("7", "player2", "I'm good"),
    createMessage("8", "player1", "Great!"),
    createMessage("9", "player2", "Perfect!"), // 6 user messages = 3 × 2 players
  ];

  const result = checkWarmupTransition(game, messages);

  assertEquals(result, true);
});

Deno.test(
  "checkWarmupTransition - multiple warmup status messages, uses last one",
  () => {
    const game = createGameData([
      { id: "player1", name: "Alice" },
      { id: "player2", name: "Bob" },
    ]);

    const messages: MessageData[] = [
      createMessage("1", "system", "talking_warmup", "status"), // First warmup
      createMessage("2", "player1", "Hello from first warmup"),
      createMessage("3", "player1", "Another from first warmup"),
      createMessage("4", "system", "talking_warmup", "status"), // Second warmup (should use this)
      createMessage("5", "player1", "Hello from second warmup"),
      createMessage("6", "player2", "Hi from second warmup"),
      createMessage("7", "player2", "Second message in second warmup"),
    ];

    const result = checkWarmupTransition(game, messages);

    assertEquals(result, false); // Only 3 messages since last warmup, need 6 (3 × 2 players)
  },
);

Deno.test(
  "checkWarmupTransition - multiple warmup status messages, transition after last one",
  () => {
    const game = createGameData([
      { id: "player1", name: "Alice" },
      { id: "player2", name: "Bob" },
    ]);

    const messages: MessageData[] = [
      createMessage("1", "system", "talking_warmup", "status"), // First warmup
      createMessage("2", "player1", "Hello from first warmup"),
      createMessage("3", "player1", "Another from first warmup"),
      createMessage("4", "system", "talking_warmup", "status"), // Second warmup (should use this)
      createMessage("5", "player1", "Hello from second warmup"),
      createMessage("6", "player1", "Second message from second warmup"),
      createMessage("7", "player2", "Hi from second warmup"),
      createMessage("8", "player2", "Second message in second warmup"),
      createMessage("9", "player1", "Third from second warmup"),
      createMessage("10", "player2", "Third from second warmup"), // 6 messages since last warmup = 3 × 2 players
    ];

    const result = checkWarmupTransition(game, messages);

    assertEquals(result, true); // 6 total messages since last warmup
  },
);

Deno.test("checkWarmupTransition - three players scenario", () => {
  const game = createGameData([
    { id: "player1", name: "Alice" },
    { id: "player2", name: "Bob" },
    { id: "player3", name: "Charlie" },
  ]);

  const messages: MessageData[] = [
    createMessage("1", "system", "talking_warmup", "status"),
    createMessage("2", "player1", "Hello"),
    createMessage("3", "player1", "How are you?"),
    createMessage("4", "player2", "Hi there"),
    createMessage("5", "player2", "I'm good"),
    createMessage("6", "player3", "Hey everyone"),
    createMessage("7", "player3", "Nice to meet you"),
    createMessage("8", "player1", "Great!"),
    createMessage("9", "player2", "Perfect!"),
    createMessage("10", "player3", "Awesome!"), // 9 messages total = 3 × 3 players
  ];

  const result = checkWarmupTransition(game, messages);

  assertEquals(result, true);
});

Deno.test(
  "checkWarmupTransition - three players not quite enough messages",
  () => {
    const game = createGameData([
      { id: "player1", name: "Alice" },
      { id: "player2", name: "Bob" },
      { id: "player3", name: "Charlie" },
    ]);

    const messages: MessageData[] = [
      createMessage("1", "system", "talking_warmup", "status"),
      createMessage("2", "player1", "Hello"),
      createMessage("3", "player1", "How are you?"),
      createMessage("4", "player2", "Hi there"),
      createMessage("5", "player2", "I'm good"),
      createMessage("6", "player3", "Hey everyone"),
      createMessage("7", "player3", "Nice to meet you"),
      createMessage("8", "player1", "Great!"), // Only 8 messages, need 9 (3 × 3 players)
    ];

    const result = checkWarmupTransition(game, messages);

    assertEquals(result, false);
  },
);

Deno.test(
  "checkWarmupTransition - ignores messages before talking_warmup status",
  () => {
    const game = createGameData([
      { id: "player1", name: "Alice" },
      { id: "player2", name: "Bob" },
    ]);

    const messages: MessageData[] = [
      // Messages before warmup should be ignored
      createMessage("1", "player1", "Message from lobby"),
      createMessage("2", "player2", "Another lobby message"),
      createMessage("3", "player1", "Third lobby message"),
      createMessage("4", "player2", "Fourth lobby message"),
      createMessage("5", "player1", "Fifth lobby message"),
      createMessage("6", "player2", "Sixth lobby message"),
      // Warmup starts here
      createMessage("7", "system", "talking_warmup", "status"),
      // Only these messages should count towards the 3x players threshold
      createMessage("8", "player1", "First warmup message"),
      createMessage("9", "player2", "Second warmup message"),
      createMessage("10", "player1", "Third warmup message"),
      createMessage("11", "player2", "Fourth warmup message"),
      createMessage("12", "player1", "Fifth warmup message"),
      createMessage("13", "player2", "Sixth warmup message"), // 6 messages = 3 × 2 players
    ];

    const result = checkWarmupTransition(game, messages);

    assertEquals(result, true); // Should transition despite having many messages before warmup
  },
);

Deno.test(
  "checkWarmupTransition - not enough messages after talking_warmup status",
  () => {
    const game = createGameData([
      { id: "player1", name: "Alice" },
      { id: "player2", name: "Bob" },
    ]);

    const messages: MessageData[] = [
      // Many messages before warmup
      createMessage("1", "player1", "Message from lobby"),
      createMessage("2", "player2", "Another lobby message"),
      createMessage("3", "player1", "Third lobby message"),
      createMessage("4", "player2", "Fourth lobby message"),
      createMessage("5", "player1", "Fifth lobby message"),
      createMessage("6", "player2", "Sixth lobby message"),
      // Warmup starts here
      createMessage("7", "system", "talking_warmup", "status"),
      // Not enough messages after warmup
      createMessage("8", "player1", "First warmup message"),
      createMessage("9", "player2", "Second warmup message"),
      createMessage("10", "player1", "Third warmup message"), // Only 3 messages, need 6 (3 × 2 players)
    ];

    const result = checkWarmupTransition(game, messages);

    assertEquals(result, false); // Should not transition
  },
);

Deno.test("checkWarmupTransition - edge case with empty messages array", () => {
  const game = createGameData([{ id: "player1", name: "Alice" }]);

  const messages: MessageData[] = [createMessage("1", "player1", "Hello")];

  const result = checkWarmupTransition(game, messages);

  assertEquals(result, false);
});
