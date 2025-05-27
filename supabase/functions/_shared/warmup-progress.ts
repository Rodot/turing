import { GameData, MessageData } from "../_types/Database.type.ts";

/**
 * Pure function to calculate warmup progress
 * @param game The current game state
 * @param messages All messages in the game
 * @returns Progress as a number between 0 and 1, or null if not in warmup
 */
export function getWarmupProgress(
  game: GameData,
  messages: MessageData[],
): number | null {
  if (game.status !== "talking_warmup") {
    return null;
  }

  // Find the last status message indicating talking_warmup started
  const lastWarmupStatusIndex = messages.findLastIndex(
    (m) => m.type === "status" && m.content === "talking_warmup",
  );

  if (lastWarmupStatusIndex === -1) {
    return 0;
  }

  // Get all messages since warmup started
  const messagesSinceWarmup = messages.slice(lastWarmupStatusIndex + 1);

  // Get only user messages since warmup
  const userMessagesSinceWarmup = messagesSinceWarmup.filter(
    (m) => m.type === "user",
  ) as MessageData[];

  // Calculate threshold: 3 messages per player
  const messageThreshold = game.players.length * 3;

  // Calculate progress (capped at 1.0)
  const progress = Math.min(
    userMessagesSinceWarmup.length / messageThreshold,
    1.0,
  );

  return progress;
}
