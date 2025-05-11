"use client";

import React, { createContext } from "react";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v13-appRouter";
import { ThemeProvider } from "@mui/material/styles";
import { theme } from "../theme";
import { Room, useRoom } from "@/hooks/useRoom";
import {
  MessageData,
  PlayerData,
  ProfileData,
} from "@/supabase/functions/_types/Database.type";
import { useTable } from "@/hooks/useTable";
import { supabase } from "@/utils/supabase/client";
import { useProfileQuery } from "@/hooks/useProfileQuery";

// Create contexts
export const MessagesContext = createContext<MessageData[]>([]);
export const RoomContext = createContext<Room | undefined>(undefined);
export const RoomProfilesContext = createContext<ProfileData[]>([]);
export const PlayersContext = createContext<PlayerData[]>([]);

// Create the wrapper component
export function ContextProvider({ children }: React.PropsWithChildren) {
  const profileQuery = useProfileQuery();
  const room = useRoom(profileQuery.data);
  const profiles = useTable<ProfileData>(supabase, {
    tableName: "profiles",
    filterColumn: "room_id",
    filterValue: room?.data?.id,
  });
  const players = useTable<PlayerData>(supabase, {
    tableName: "players",
    filterColumn: "room_id",
    filterValue: room?.data?.id,
  });
  const messages = useTable<MessageData>(supabase, {
    tableName: "messages",
    filterColumn: "room_id",
    filterValue: room?.data?.id,
  });

  return (
    <AppRouterCacheProvider>
      <ThemeProvider theme={theme}>
        <RoomContext.Provider value={room}>
          <RoomProfilesContext.Provider value={profiles}>
            <PlayersContext.Provider value={players}>
              <MessagesContext.Provider value={messages}>
                {children}
              </MessagesContext.Provider>
            </PlayersContext.Provider>
          </RoomProfilesContext.Provider>
        </RoomContext.Provider>
      </ThemeProvider>
    </AppRouterCacheProvider>
  );
}
