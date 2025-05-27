import { SupabaseClient } from "https://esm.sh/v135/@supabase/supabase-js@2.43.2/dist/module/index.js";
import { GameData, PlayerData, GameStatus } from "../_types/Database.type.ts";
import { insertMessage } from "./messages.query.ts";

export const fetchGame = async (supabase: SupabaseClient, id: string) => {
  const req = await supabase.from("games").select("*").eq("id", id);
  if (req.error) {
    throw new Error(req.error.message);
  }
  const game: GameData | null = req?.data?.[0] ?? null;
  return game;
};

export const insertGame = async (supabase: SupabaseClient) => {
  const req = await supabase.from("games").insert({}).select();
  if (req.error) {
    throw new Error(req.error.message);
  }
  const game: GameData = req?.data?.[0];
  return game;
};

export const updateGame = async (
  supabase: SupabaseClient,
  id: string,
  data: Partial<GameData>,
) => {
  const req = await supabase.from("games").update(data).eq("id", id);
  if (req.error) {
    throw new Error(req.error.message);
  }
};

export const updateGameWithStatusTransition = async (
  supabase: SupabaseClient,
  id: string,
  newStatus: GameStatus,
) => {
  const game = await fetchGame(supabase, id);
  if (!game) throw new Error("Game not found");

  const currentStatus = game.status;

  // Validate status transition
  const validTransitions: Record<string, string[]> = {
    lobby: ["talking_warmup", "over"],
    talking_warmup: ["talking_hunt", "over"],
    talking_hunt: ["voting", "over"],
    voting: ["talking_warmup", "over"],
    over: [],
  };

  const allowedNextStates = validTransitions[currentStatus] || [];

  if (!allowedNextStates.includes(newStatus)) {
    throw new Error(
      `Invalid status transition: ${currentStatus} -> ${newStatus}. ` +
        `Allowed transitions from ${currentStatus}: ${allowedNextStates.join(", ")}`,
    );
  }

  // Use atomic update with where condition to prevent race conditions
  const req = await supabase
    .from("games")
    .update({ status: newStatus })
    .eq("id", id)
    .eq("status", currentStatus);

  if (req.error) {
    throw new Error(req.error.message);
  }

  // Check if any rows were affected to detect race condition
  if (req.count === 0) {
    throw new Error(
      `Status transition failed: game status changed from ${currentStatus} before update could complete`,
    );
  }

  // Post status message after successful state change
  await insertMessage(supabase, {
    game_id: id,
    type: "status",
    content: newStatus,
  });
};

export const addPlayerToGame = async (
  supabase: SupabaseClient,
  gameId: string,
  player: PlayerData,
) => {
  const game = await fetchGame(supabase, gameId);
  if (!game) throw new Error("Game not found");

  const existingPlayerIndex = game.players.findIndex((p) => p.id === player.id);
  if (existingPlayerIndex >= 0) {
    // Update existing player
    game.players[existingPlayerIndex] = player;
  } else {
    // Add new player
    game.players.push(player);
  }

  await updateGame(supabase, gameId, { players: game.players });
};

export const updatePlayerInGame = async (
  supabase: SupabaseClient,
  gameId: string,
  playerId: string,
  updates: Partial<PlayerData>,
) => {
  const game = await fetchGame(supabase, gameId);
  if (!game) throw new Error("Game not found");

  const playerIndex = game.players.findIndex((p) => p.id === playerId);
  if (playerIndex < 0) throw new Error("Player not found in game");

  game.players[playerIndex] = { ...game.players[playerIndex], ...updates };
  await updateGame(supabase, gameId, { players: game.players });
};

export const updateAllPlayersInGame = async (
  supabase: SupabaseClient,
  gameId: string,
  updates: Partial<Omit<PlayerData, "id" | "name">>,
) => {
  const game = await fetchGame(supabase, gameId);
  if (!game) throw new Error("Game not found");

  game.players = game.players.map((player) => ({ ...player, ...updates }));
  await updateGame(supabase, gameId, { players: game.players });
};

export const fetchAllGames = async (supabase: SupabaseClient) => {
  const req = await supabase
    .from("games")
    .select("*")
    .order("created_at", { ascending: false });

  if (req.error) {
    throw new Error(req.error.message);
  }

  const games: GameData[] = req?.data ?? [];
  return games;
};

export const fetchGameAndCheckStatus = async (
  supabase: SupabaseClient,
  gameId: string,
  expectedStatus: GameStatus | GameStatus[],
) => {
  const game = await fetchGame(supabase, gameId);
  if (!game) {
    throw new Error("Game not found");
  }

  const validStatuses = Array.isArray(expectedStatus)
    ? expectedStatus
    : [expectedStatus];

  if (!validStatuses.includes(game.status)) {
    const statusList = validStatuses.map((s) => `"${s}"`).join(" or ");
    throw new Error(
      `Game status must be ${statusList} but is "${game.status}"`,
    );
  }

  return game;
};
