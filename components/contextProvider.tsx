"use client";

import React, { createContext } from "react";
import { useUser } from "@/hooks/useUser";
import { User } from "@supabase/supabase-js";
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

// Create the context
export const UserContext = createContext<User | null>(null);
export const UserProfileContext = createContext<ProfileData | null>(null);
export const MessagesContext = createContext<MessageData[]>([]);
export const RoomContext = createContext<Room | null>(null);
export const RoomProfilesContext = createContext<ProfileData[]>([]);
export const PlayersContext = createContext<PlayerData[]>([]);

// Create the wrapper component
export function ContextProvider({ children }: React.PropsWithChildren) {
  const myUser = useUser();
  const myProfile = useTable<ProfileData>(supabase, {
    tableName: "profiles",
    filterColumn: "id",
    filterValue: myUser?.id,
  });
  const room = useRoom(myProfile?.[0]);
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
        <UserContext.Provider value={myUser as any}>
          <UserProfileContext.Provider value={myProfile?.[0]}>
            <RoomContext.Provider value={room}>
              <RoomProfilesContext.Provider value={profiles}>
                <PlayersContext.Provider value={players}>
                  <MessagesContext.Provider value={messages}>
                    {children}
                  </MessagesContext.Provider>
                </PlayersContext.Provider>
              </RoomProfilesContext.Provider>
            </RoomContext.Provider>
          </UserProfileContext.Provider>
        </UserContext.Provider>
      </ThemeProvider>
    </AppRouterCacheProvider>
  );
}
