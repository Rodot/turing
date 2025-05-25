import { GameData, MessageData } from "../_types/Database.type.ts";

/**
 * Pure function to determine if game should transition from talking_warmup to talking_hunt
 * @param game The current game state
 * @param messages All messages in the game (including the latest message)
 * @returns Whether transition should happen and message counts for debugging
 */
export function checkWarmupTransition(
  game: GameData,
  messages: MessageData[],
): boolean {
  // Find the last status message indicating talking_warmup started
  const lastWarmupStatusIndex = messages.findLastIndex(
    (m) => m.type === "status" && m.content === "talking_warmup",
  );

  if (lastWarmupStatusIndex === -1) {
    // No warmup status message found, can't determine when warmup started
    return false;
  }

  // Get all messages since warmup started
  const messagesSinceWarmup = messages.slice(lastWarmupStatusIndex + 1);

  // Get only user messages since warmup
  const userMessagesSinceWarmup = messagesSinceWarmup.filter(
    (m) => m.type === "user",
  ) as MessageData[];

  // Count messages per player
  const messageCountsByPlayer = new Map<string, number>();

  for (const player of game.players) {
    const playerMessages = userMessagesSinceWarmup.filter(
      (m) => m.profile_id === player.id,
    );
    messageCountsByPlayer.set(player.id, playerMessages.length);
  }

  // Check if all players have at least 2 messages
  const shouldTransition = game.players.every(
    (player) => (messageCountsByPlayer.get(player.id) || 0) >= 2,
  );

  console.log(
    `Message counts since warmup for game ${game.id}:`,
    Array.from(messageCountsByPlayer.entries()).map(([id, count]) => ({
      id,
      count,
    })),
  );

  return shouldTransition;
}
