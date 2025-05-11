"use client";

import { RoomData } from "@/supabase/functions/_types/Database.type";
import { supabase } from "@/utils/supabase/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useProfileQuery } from "./useProfileQuery";
import { fetchRoom } from "@/queries/db/room.query";
import {
  createRoomFunction,
  startGameFunction,
} from "@/queries/functions/functions.query";
import {
  removeProfileFromRoom,
  updateProfileRoom,
} from "@/queries/db/profile.query";
import { updateRoom } from "@/queries/db/room.query";
import { useRouter } from "next/navigation";
import { useRoomId } from "./useRoomId";
import { useEffect } from "react";

export const useRoomQuery = () => {
  const queryClient = useQueryClient();
  const roomId = useRoomId();

  const query = useQuery({
    queryKey: ["room", roomId],
    queryFn: async (): Promise<RoomData | undefined> => {
      if (!roomId) return undefined;
      const room = await fetchRoom(supabase, roomId);
      return room || undefined;
    },
    enabled: !!roomId,
  });

  // Set up real-time subscription
  useEffect(() => {
    if (!roomId) return;

    const channel = supabase
      .channel(`room-${roomId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "rooms",
          filter: `id=eq.${roomId}`,
        },
        () => {
          // Invalidate query when changes detected
          queryClient.invalidateQueries({ queryKey: ["room", roomId] });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomId, queryClient]);

  return query;
};

export const useCreateRoomMutation = () => {
  const queryClient = useQueryClient();
  const profileQuery = useProfileQuery();
  const profile = profileQuery.data;
  const router = useRouter();

  return useMutation({
    mutationFn: async () => {
      return await createRoomFunction(supabase);
    },
    onSuccess: (roomId) => {
      if (roomId && profile?.id) {
        // Join the created room
        updateProfileRoom(supabase, profile.id, roomId);
        // Invalidate profile query to trigger a refetch
        queryClient.invalidateQueries({ queryKey: ["profile", profile.id] });
        router.push(`/game?room=${roomId}`);
      }
    },
  });
};

export const useJoinRoomMutation = () => {
  const queryClient = useQueryClient();
  const profileQuery = useProfileQuery();
  const profile = profileQuery.data;
  const router = useRouter();

  return useMutation({
    mutationFn: async (roomId: string) => {
      if (!profile?.id) throw new Error("User not authenticated");
      await updateProfileRoom(supabase, profile.id, roomId);
      return { profileId: profile.id, roomId };
    },
    onSuccess: (data) => {
      // Invalidate profile query to trigger a refetch
      queryClient.invalidateQueries({ queryKey: ["profile", data.profileId] });
      router.push(`/game?room=${data.roomId}`);
    },
  });
};

export const useLeaveRoomMutation = () => {
  const queryClient = useQueryClient();
  const profileQuery = useProfileQuery();
  const profile = profileQuery.data;
  const router = useRouter();

  return useMutation({
    mutationFn: async () => {
      if (!profile?.id) throw new Error("User not authenticated");
      await removeProfileFromRoom(supabase, profile.id);
      return { profileId: profile.id };
    },
    onSuccess: (data) => {
      // Invalidate profile query to trigger a refetch
      queryClient.invalidateQueries({ queryKey: ["profile", data.profileId] });
      router.push(`/`);
    },
  });
};

export const useStartGameMutation = () => {
  const queryClient = useQueryClient();
  const profileQuery = useProfileQuery();
  const profile = profileQuery.data;
  const roomId = profile?.room_id;

  return useMutation({
    mutationFn: async () => {
      if (!roomId) throw new Error("No room joined");
      await startGameFunction(supabase, roomId);
      return { roomId };
    },
    onSuccess: (data) => {
      // Invalidate room query to trigger a refetch
      queryClient.invalidateQueries({ queryKey: ["room", data.roomId] });
    },
  });
};

export const useRoomLanguageMutation = () => {
  const queryClient = useQueryClient();
  const roomId = useRoomId();

  return useMutation({
    mutationFn: async (lang: "en" | "fr") => {
      if (!roomId) throw new Error("No room joined");
      await updateRoom(supabase, roomId, { lang });
      return { roomId };
    },
    onSuccess: (data) => {
      // Invalidate room query to trigger a refetch
      queryClient.invalidateQueries({ queryKey: ["room", data.roomId] });
    },
  });
};
