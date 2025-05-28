import { MessageData, PlayerData } from "../_types/Database.type.ts";
import { pickRandom } from "../_shared/utils.ts";

/**
 * Pure function to determine the next bot selection
 * @param messages - All messages from the game
 * @param players - All players in the game
 * @returns The selected bot player, or null if no bot should be selected
 */
export function selectNextBot(
  messages: MessageData[],
  players: PlayerData[],
): PlayerData | null {
  // Filter bot_picked messages to understand previous rounds
  const botPickedMessages = messages.filter((msg) => msg.type === "bot_picked");
  const hadPreviousRound = botPickedMessages.length > 0;

  // Get the last bot selection (could be "none" or a player ID)
  const lastBotSelection = hadPreviousRound
    ? botPickedMessages[botPickedMessages.length - 1].content
    : null;

  // Apply probability of no bot if there was a previous round AND the last round wasn't "none"
  const canHaveNoBotThisRound = hadPreviousRound && lastBotSelection !== "none";
  const noBotThisRound =
    canHaveNoBotThisRound && Math.random() <= 1 / (players.length + 1);

  // If we decided no bot this round, return null
  if (noBotThisRound) {
    return null;
  }

  // Filter out the last bot to avoid consecutive selection
  const availablePlayers = players.filter(
    (player) => player.id !== lastBotSelection,
  );

  // If no available players (shouldn't happen in practice), return null
  if (availablePlayers.length === 0) {
    return null;
  }

  // Pick a random available player
  return pickRandom(availablePlayers);
}
