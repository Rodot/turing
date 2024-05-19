"use client";

import React, { createContext } from "react";
import { useUser } from "@/hooks/useUser";
import { User } from "@supabase/supabase-js";
import { useMessages } from "@/hooks/useMessages";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v13-appRouter";
import { ThemeProvider } from "@mui/material/styles";
import { theme } from "../theme";
import { RoomContext, useRoomContext } from "@/hooks/useRoom";
import { Message, Profile } from "@/types/Database.type";
import { useRoomContextUsers } from "@/hooks/useRoomUsers";

// Create the context
export const UserContext = createContext<User | null>(null);
export const MessagesContext = createContext<Message[]>([]);
export const RoomContextContext = createContext<RoomContext | null>(null);
export const RoomContextProfilesContext = createContext<Profile[]>([]);

// Create the wrapper component
export function ContextProvider({ children }: React.PropsWithChildren<{}>) {
  const user = useUser();
  const room = useRoomContext(user);
  const roomUsers = useRoomContextUsers(room?.id ?? null);
  const messages = useMessages(room?.id ?? null);

  return (
    <AppRouterCacheProvider>
      <ThemeProvider theme={theme}>
        <UserContext.Provider value={user}>
          <RoomContextContext.Provider value={room}>
            <RoomContextProfilesContext.Provider value={roomUsers}>
              <MessagesContext.Provider value={messages}>
                {children}
              </MessagesContext.Provider>
            </RoomContextProfilesContext.Provider>
          </RoomContextContext.Provider>
        </UserContext.Provider>
      </ThemeProvider>
    </AppRouterCacheProvider>
  );
}
