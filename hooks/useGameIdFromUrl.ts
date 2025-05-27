import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

export const useGameIdFromUrl = () => {
  const [gameId, setGameId] = useState<string | null>("");
  const searchParams = useSearchParams();

  useEffect(() => {
    const newGameId = searchParams.get("game") ?? null;
    if (newGameId !== gameId) {
      setGameId(newGameId);
    }
  }, [searchParams, gameId]);

  return gameId;
};
