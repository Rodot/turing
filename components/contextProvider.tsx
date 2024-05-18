"use client";

import React, { createContext } from "react";
import { useUser } from "@/hooks/useUser";
import { User } from "@supabase/supabase-js";
import { useMessages } from "@/hooks/useMessages";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v13-appRouter";
import { ThemeProvider } from "@mui/material/styles";
import { theme } from "../theme";
import { Group, useGroup } from "@/hooks/useGroup";
import { Message, Profile } from "@/types/Database.type";
import { useGroupUsers } from "@/hooks/useGroupUsers";

// Create the context
export const UserContext = createContext<User | null>(null);
export const MessagesContext = createContext<Message[]>([]);
export const GroupContext = createContext<Group | null>(null);
export const GroupProfilesContext = createContext<Profile[]>([]);

// Create the wrapper component
export function ContextProvider({ children }: React.PropsWithChildren<{}>) {
  const user = useUser();
  const group = useGroup(user);
  const groupUsers = useGroupUsers(group?.id ?? null);
  const messages = useMessages(group?.id ?? null);

  return (
    <AppRouterCacheProvider>
      <ThemeProvider theme={theme}>
        <UserContext.Provider value={user}>
          <GroupContext.Provider value={group}>
            <GroupProfilesContext.Provider value={groupUsers}>
              <MessagesContext.Provider value={messages}>
                {children}
              </MessagesContext.Provider>
            </GroupProfilesContext.Provider>
          </GroupContext.Provider>
        </UserContext.Provider>
      </ThemeProvider>
    </AppRouterCacheProvider>
  );
}
