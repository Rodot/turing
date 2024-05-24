import React, { useContext } from "react";
import { MessagesContext, RoomContext } from "./contextProvider";
import { LinearProgress, SxProps, Theme } from "@mui/material";

type Props = {
  sx?: SxProps<Theme>;
};

export const VoteCountdown: React.FC<Props> = ({ sx }) => {
  const room = useContext(RoomContext);
  const messages = useContext(MessagesContext);

  const numMessages =
    messages?.filter((m) => m.author !== "system")?.length ?? 0;
  const lastVote = room?.data?.last_vote ?? 0;
  const nextVote = room?.data?.next_vote ?? 1;
  const progress = Math.max(
    0,
    Math.min((100 * (numMessages - lastVote)) / (nextVote - lastVote), 100)
  );

  return (
    <LinearProgress color="secondary" variant="determinate" value={progress} />
  );
};
