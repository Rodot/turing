import React from "react";
import { LinearProgress } from "@mui/material";
import { useGameQuery } from "@/hooks/useGameQuery";
import { useMessagesQuery } from "@/hooks/useMessagesQuery";
import { getWarmupProgress } from "@/supabase/functions/_shared/warmup-progress";
import { getVotingProgress } from "@/supabase/functions/_shared/voting-progress";

export const WarmupProgressBar: React.FC = () => {
  const gameQuery = useGameQuery();
  const messagesQuery = useMessagesQuery();
  const gameStatus = gameQuery?.data?.status;

  const warmupProgress =
    gameQuery.data && messagesQuery.data
      ? getWarmupProgress(gameQuery.data, messagesQuery.data)
      : null;

  const votingProgress = gameQuery.data
    ? getVotingProgress(gameQuery.data)
    : null;

  // Show appropriate progress based on game status
  const progressValue = (() => {
    if (gameStatus === "talking_warmup" && warmupProgress !== null) {
      return warmupProgress * 100;
    }
    if (gameStatus === "voting" && votingProgress !== null) {
      return votingProgress * 100;
    }
    // Show 100% progress for other phases to prevent layout shifts
    return 100;
  })();

  return (
    <LinearProgress
      variant="determinate"
      value={progressValue}
      color="secondary"
      sx={{
        height: 4,
        borderRadius: 0,
      }}
    />
  );
};
