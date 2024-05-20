import { PlayerData } from "@/supabase/functions/_types/Database.type";
import { User } from "@supabase/supabase-js";

export function shortenId(id: string | null | undefined): string {
  return id?.substring(0, 5)?.toUpperCase() ?? "...";
}

export function formatUser(user: User | null | undefined): string {
  return shortenId(user?.id);
}

export function playerName(
  userId: string | undefined,
  players: PlayerData[]
): string {
  if (!userId) return "...";
  const player = players.find((player) => player.user_id === userId);
  return player?.name ?? shortenId(userId);
}
