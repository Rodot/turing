import React from "react";
import { LinearProgress } from "@mui/material";
import { isNotSystem } from "@/supabase/functions/_shared/utils";
import { useGameQuery } from "@/hooks/useGameQuery";
import { useMessagesQuery } from "@/hooks/useMessagesQuery";

type Props = Record<string, never>;

export const VoteCountdown: React.FC<Props> = () => {
  const gameQuery = useGameQuery();
  const messagesQuery = useMessagesQuery();
  const messages = messagesQuery.data || [];

  const numMessages = messages?.filter(isNotSystem)?.length ?? 0;
  const lastVote = gameQuery?.data?.last_vote ?? 0;
  const nextVote = gameQuery?.data?.next_vote ?? 1;
  const progress = Math.max(
    0,
    Math.min((100 * (numMessages - lastVote)) / (nextVote - 1 - lastVote), 100),
  );

  return (
    <LinearProgress color="secondary" variant="determinate" value={progress} />
  );
};
