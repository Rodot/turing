import { SupabaseClient } from "https://esm.sh/v135/@supabase/supabase-js@2.43.2/dist/module/index.js";
import { GameData, PlayerData } from "../_types/Database.type.ts";

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
