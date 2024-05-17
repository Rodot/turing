"use client";

import React, { createContext } from "react";
import { useUser } from "@/app/hooks/useUser";
import { User } from "@supabase/supabase-js";

// Create the context
export const UserContext = createContext<User | null>(null);

// Create the wrapper component
export default function ContextProvider({
  children,
}: React.PropsWithChildren<{}>) {
  const user = useUser();
  return <UserContext.Provider value={user}>{children}</UserContext.Provider>;
}
