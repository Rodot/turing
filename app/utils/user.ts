import { User } from "@supabase/supabase-js";

export function formatUser(user: User | null): string {
  return user?.id?.substring(0, 5).toUpperCase() ?? "...";
}
