import React from "react";
import { LinearProgress } from "@mui/material";
import { useGameQuery } from "@/hooks/useGameQuery";
import { useMessagesQuery } from "@/hooks/useMessagesQuery";
import { getWarmupProgress } from "@/supabase/functions/_shared/warmup-progress";

export const WarmupProgressBar: React.FC = () => {
  const gameQuery = useGameQuery();
  const messagesQuery = useMessagesQuery();
  const gameStatus = gameQuery?.data?.status;

  const warmupProgress =
    gameQuery.data && messagesQuery.data
      ? getWarmupProgress(gameQuery.data, messagesQuery.data)
      : null;

  // Show 100% progress when not in warmup mode to prevent layout shifts
  const progressValue =
    gameStatus === "talking_warmup" && warmupProgress !== null
      ? warmupProgress * 100
      : 100;

  return (
    <LinearProgress
      variant="determinate"
      value={progressValue}
      color="primary"
      sx={{
        height: 4,
        borderRadius: 0,
      }}
    />
  );
};
