"use client";

import React, { createContext } from "react";
import { useUser } from "@/hooks/useUser";
import { User } from "@supabase/supabase-js";
import { useMessages } from "@/hooks/useMessages";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v13-appRouter";
import { ThemeProvider } from "@mui/material/styles";
import { theme } from "../theme";
import { Room, useRoom } from "@/hooks/useRoom";
import { MessageData, ProfileData } from "@/types/Database.type";
import { useRoomProfiles } from "@/hooks/useRoomProfiles";

// Create the context
export const UserContext = createContext<User | null>(null);
export const MessagesContext = createContext<MessageData[]>([]);
export const RoomContext = createContext<Room | null>(null);
export const RoomProfilesContext = createContext<ProfileData[]>([]);

// Create the wrapper component
export function ContextProvider({ children }: React.PropsWithChildren<{}>) {
  const user = useUser();
  const room = useRoom(user);
  const roomProfiles = useRoomProfiles(room?.data?.id ?? null);
  const messages = useMessages(room?.data?.id ?? null);

  return (
    <AppRouterCacheProvider>
      <ThemeProvider theme={theme}>
        <UserContext.Provider value={user}>
          <RoomContext.Provider value={room}>
            <RoomProfilesContext.Provider value={roomProfiles}>
              <MessagesContext.Provider value={messages}>
                {children}
              </MessagesContext.Provider>
            </RoomProfilesContext.Provider>
          </RoomContext.Provider>
        </UserContext.Provider>
      </ThemeProvider>
    </AppRouterCacheProvider>
  );
}
