import React, { useEffect, useState } from "react";
import { LinearProgress } from "@mui/material";

type Props = {
  duration: number;
};

export const ProgressTimer: React.FC<Props> = ({ duration }) => {
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
