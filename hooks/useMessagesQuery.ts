"use client";

import { MessageData } from "@/supabase/functions/_types/Database.type";
import { supabase } from "@/utils/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { useGameIdFromUrl } from "../components/gameIdProvider";
import { fetchMessages } from "@/queries/db/messages.query";

export const useMessagesQuery = () => {
  const gameIdFromUrl = useGameIdFromUrl();

  const query = useQuery({
    queryKey: ["messages", gameIdFromUrl],
    queryFn: async (): Promise<MessageData[]> => {
      if (!gameIdFromUrl) return [];
      const messages = await fetchMessages(supabase, gameIdFromUrl);
      return messages;
    },
    enabled: !!gameIdFromUrl,
  });

  return query;
};
