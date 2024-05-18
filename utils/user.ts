import { User } from "@supabase/supabase-js";

export function shortenId(id: string | null | undefined): string {
  return id?.substring(0, 5)?.toUpperCase() ?? "...";
}

export function formatUser(user: User | null | undefined): string {
  return shortenId(user?.id);
}
