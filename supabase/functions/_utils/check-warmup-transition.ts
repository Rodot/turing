import { GameData, MessageData } from "../_types/Database.type.ts";
import { getWarmupProgress } from "../_shared/warmup-progress.ts";

/**
 * Pure function to determine if game should transition from talking_warmup to talking_hunt
 * @param game The current game state
 * @param messages All messages in the game (including the latest message)
 * @returns Whether transition should happen
 */
export function checkWarmupTransition(
  game: GameData,
  messages: MessageData[],
): boolean {
  const progress = getWarmupProgress(game, messages);

  // Transition when progress reaches 100% (1.0)
  return progress !== null && progress >= 1.0;
}
