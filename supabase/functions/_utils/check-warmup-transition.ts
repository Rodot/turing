import { GameData, MessageData } from "../_types/Database.type.ts";

export type WarmupTransitionResult = {
  shouldTransition: boolean;
  messageCountsByPlayer: Map<string, number>;
  userMessagesSinceWarmup: MessageData[];
};

/**
 * Pure function to determine if game should transition from talking_warmup to talking_hunt
 * @param game The current game state
 * @param messages All messages in the game (before the new message)
 * @param newMessage The message that was just posted
 * @returns Whether transition should happen and message counts for debugging
 */
export function checkWarmupTransition(
  game: GameData,
  messages: MessageData[],
  newMessage: Partial<MessageData>,
): WarmupTransitionResult {
  // Find the last status message indicating talking_warmup started
  const lastWarmupStatusIndex = messages.findLastIndex(
    (m) => m.type === "status" && m.content === "talking_warmup",
  );

  if (lastWarmupStatusIndex === -1) {
    // No warmup status message found, can't determine when warmup started
    return {
      shouldTransition: false,
      messageCountsByPlayer: new Map(),
      userMessagesSinceWarmup: [],
    };
  }

  // Get all messages since warmup started
  const messagesSinceWarmup = messages.slice(lastWarmupStatusIndex + 1);

  // Add the new message we just posted to the list
  const allMessagesSinceWarmup = [...messagesSinceWarmup, newMessage];

  // Get only user messages since warmup (including the new one)
  const userMessagesSinceWarmup = allMessagesSinceWarmup.filter(
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

  return {
    shouldTransition,
    messageCountsByPlayer,
    userMessagesSinceWarmup,
  };
}
