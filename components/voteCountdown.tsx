import React, { useContext } from "react";
import { MessagesContext, RoomContext } from "./contextProvider";
import { LinearProgress } from "@mui/material";
import { isNotSystem } from "@/supabase/functions/_shared/utils";

type Props = Record<string, never>;

export const VoteCountdown: React.FC<Props> = () => {
  const room = useContext(RoomContext);
  const messages = useContext(MessagesContext);

  const numMessages = messages?.filter(isNotSystem)?.length ?? 0;
  const lastVote = room?.data?.last_vote ?? 0;
  const nextVote = room?.data?.next_vote ?? 1;
  const progress = Math.max(
    0,
    Math.min((100 * (numMessages - lastVote)) / (nextVote - 1 - lastVote), 100),
  );

  return (
    <LinearProgress color="secondary" variant="determinate" value={progress} />
  );
};
