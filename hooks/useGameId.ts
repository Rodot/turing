import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

export const useGameId = () => {
  const [gameId, setGameId] = useState("");
  const searchParams = useSearchParams();

  useEffect(() => {
    const newGameId = searchParams.get("game") ?? null;
    if (newGameId?.length && newGameId !== gameId) {
      setGameId(newGameId);
    }
  }, [searchParams, gameId]);

  return gameId;
};
