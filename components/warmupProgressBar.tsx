import React from "react";
import { useGameQuery } from "@/hooks/useGameQuery";
import { useMessagesQuery } from "@/hooks/useMessagesQuery";
import { getWarmupProgress } from "@/supabase/functions/_shared/warmup-progress";
import { ProgressTimer } from "./progressTimer";
import { LinearProgress } from "@mui/material";

export const WarmupProgressBar: React.FC = () => {
  const gameQuery = useGameQuery();
  const messagesQuery = useMessagesQuery();
  const gameStatus = gameQuery?.data?.status;

  const warmupProgress =
    gameQuery.data && messagesQuery.data
      ? getWarmupProgress(gameQuery.data, messagesQuery.data)
      : null;

  // Show appropriate progress based on game status
  if (gameStatus === "talking_warmup" && warmupProgress !== null) {
    return (
      <LinearProgress
        variant="determinate"
        value={warmupProgress * 100}
        color="secondary"
        sx={{
          height: 4,
          borderRadius: 0,
        }}
      />
    );
  }

  if (gameStatus === "voting") {
    return <ProgressTimer duration={30} />;
  }

  // Show 100% progress for other phases to prevent layout shifts
  return (
    <LinearProgress
      variant="determinate"
      value={100}
      color="secondary"
      sx={{
        height: 4,
        borderRadius: 0,
      }}
    />
  );
};
