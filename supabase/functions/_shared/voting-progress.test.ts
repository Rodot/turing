import { assertEquals } from "https://deno.land/std@0.208.0/assert/mod.ts";
import { getVotingProgress } from "./voting-progress.ts";
import { GameData, PlayerData, GameStatus } from "../_types/Database.type.ts";

const createPlayer = (
  id: string,
  name: string,
  is_bot = false,
  vote: string | null = null,
  vote_blank = false,
): PlayerData => ({
  id,
  name,
  is_bot,
  vote,
  vote_blank,
  score: 0,
});

const createGame = (status: GameStatus, players: PlayerData[]): GameData => ({
  id: "test-game",
  status,
  players,
  lang: "en",
  last_bot_id: null,
});

Deno.test("getVotingProgress - returns null when not in voting phase", () => {
  const players = [createPlayer("alice", "Alice"), createPlayer("bob", "Bob")];
  const game = createGame("talking_warmup", players);

  const result = getVotingProgress(game);
  assertEquals(result, null);
});

Deno.test("getVotingProgress - returns 0 when no humans have voted", () => {
  const players = [
    createPlayer("alice", "Alice"),
    createPlayer("bob", "Bob"),
    createPlayer("bot", "Bot", true),
  ];
  const game = createGame("voting", players);

  const result = getVotingProgress(game);
  assertEquals(result, 0);
});

Deno.test(
  "getVotingProgress - returns 0.5 when half of humans have voted",
  () => {
    const players = [
      createPlayer("alice", "Alice", false, "bob"),
      createPlayer("bob", "Bob"),
      createPlayer("bot", "Bot", true, "alice"),
    ];
    const game = createGame("voting", players);

    const result = getVotingProgress(game);
    assertEquals(result, 0.5);
  },
);

Deno.test("getVotingProgress - returns 1 when all humans have voted", () => {
  const players = [
    createPlayer("alice", "Alice", false, "bob"),
    createPlayer("bob", "Bob", false, "alice"),
    createPlayer("bot", "Bot", true, "alice"),
  ];
  const game = createGame("voting", players);

  const result = getVotingProgress(game);
  assertEquals(result, 1);
});

Deno.test("getVotingProgress - counts blank votes as votes", () => {
  const players = [
    createPlayer("alice", "Alice", false, null, true),
    createPlayer("bob", "Bob", false, "alice"),
    createPlayer("carol", "Carol"),
  ];
  const game = createGame("voting", players);

  const result = getVotingProgress(game);
  assertEquals(result, 2 / 3);
});

Deno.test("getVotingProgress - ignores bot votes", () => {
  const players = [
    createPlayer("alice", "Alice", false, "bob"),
    createPlayer("bob", "Bob"),
    createPlayer("bot1", "Bot1", true, "alice"),
    createPlayer("bot2", "Bot2", true, "bob"),
  ];
  const game = createGame("voting", players);

  const result = getVotingProgress(game);
  assertEquals(result, 0.5);
});

Deno.test("getVotingProgress - handles edge case with no humans", () => {
  const players = [
    createPlayer("bot1", "Bot1", true, "bot2"),
    createPlayer("bot2", "Bot2", true, "bot1"),
  ];
  const game = createGame("voting", players);

  const result = getVotingProgress(game);
  assertEquals(result, 0);
});

Deno.test("getVotingProgress - handles empty players array", () => {
  const game = createGame("voting", []);

  const result = getVotingProgress(game);
  assertEquals(result, 0);
});
