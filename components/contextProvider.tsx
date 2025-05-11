"use client";

import React, { createContext } from "react";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v13-appRouter";
import { ThemeProvider } from "@mui/material/styles";
import { theme } from "../theme";
import {
  MessageData,
  PlayerData,
  ProfileData,
} from "@/supabase/functions/_types/Database.type";
import { useTable } from "@/hooks/useTable";
import { supabase } from "@/utils/supabase/client";
import { useRoomId } from "@/hooks/useRoomId";
import { SnackbarProvider } from "./snackbarContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Create contexts
export const MessagesContext = createContext<MessageData[]>([]);
export const RoomProfilesContext = createContext<ProfileData[]>([]);
export const PlayersContext = createContext<PlayerData[]>([]);
const queryClient = new QueryClient();

// Create the wrapper component
export function ContextProvider({ children }: React.PropsWithChildren) {
  const roomId = useRoomId();
  const profiles = useTable<ProfileData>(supabase, {
    tableName: "profiles",
    filterColumn: "room_id",
    filterValue: roomId,
  });
  const players = useTable<PlayerData>(supabase, {
    tableName: "players",
    filterColumn: "room_id",
    filterValue: roomId,
  });
  const messages = useTable<MessageData>(supabase, {
    tableName: "messages",
    filterColumn: "room_id",
    filterValue: roomId,
  });

  return (
    <QueryClientProvider client={queryClient}>
      <AppRouterCacheProvider>
        <ThemeProvider theme={theme}>
          <SnackbarProvider>
            <RoomProfilesContext.Provider value={profiles}>
              <PlayersContext.Provider value={players}>
                <MessagesContext.Provider value={messages}>
                  {children}
                </MessagesContext.Provider>
              </PlayersContext.Provider>
            </RoomProfilesContext.Provider>
          </SnackbarProvider>
        </ThemeProvider>
      </AppRouterCacheProvider>
    </QueryClientProvider>
  );
}
