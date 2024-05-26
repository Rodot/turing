import React, { useEffect, useState } from "react";
import { LinearProgress, SxProps, Theme } from "@mui/material";

type Props = {
  sx?: SxProps<Theme>;
  duration: number;
};

export const ProgressTimer: React.FC<Props> = ({ sx, duration }) => {
  const [timeLeft, setTimeLeft] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setTimeout(() => {
      setTimeLeft((prevTimeLeft) => prevTimeLeft + 1);
      setProgress(Math.min(100, (100 * timeLeft) / duration));
    }, 1000);
    return () => {
      clearInterval(interval);
    };
  }, [duration, timeLeft]);

  return (
    <LinearProgress variant="determinate" color="secondary" value={progress} />
  );
};
