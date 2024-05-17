"use client";

import React, { createContext } from "react";
import { useUser } from "@/hooks/useUser";
import { User } from "@supabase/supabase-js";
import { useMessages, Message } from "@/hooks/useMessages";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v13-appRouter";
import { ThemeProvider } from "@mui/material/styles";
import theme from "../theme";
import { Group, useGroup } from "@/hooks/useGroup";

// Create the context
export const UserContext = createContext<User | null>(null);
export const MessagesContext = createContext<Message[]>([]);
export const GroupContext = createContext<Group | null>(null);

// Create the wrapper component
export default function ContextProvider({
  children,
}: React.PropsWithChildren<{}>) {
  const user = useUser();
  const messages = useMessages();
  const group = useGroup(user);

  return (
    <AppRouterCacheProvider>
      <ThemeProvider theme={theme}>
        <UserContext.Provider value={user}>
          <GroupContext.Provider value={group}>
            <MessagesContext.Provider value={messages}>
              {children}
            </MessagesContext.Provider>
          </GroupContext.Provider>
        </UserContext.Provider>
      </ThemeProvider>
    </AppRouterCacheProvider>
  );
}
