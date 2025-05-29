"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

interface GameIdContextType {
  gameId: string | null;
}

const GameIdContext = createContext<GameIdContextType | undefined>(undefined);

export const GameIdProvider: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const [gameId, setGameId] = useState<string | null>("");
  const searchParams = useSearchParams();

  useEffect(() => {
    const newGameId = searchParams.get("game") ?? null;
    if (newGameId !== gameId) {
      setGameId(newGameId);
      console.log("Game ID updated:", gameId, newGameId);
    }
  }, [searchParams, gameId]);

  return (
    <GameIdContext.Provider value={{ gameId }}>
      {children}
    </GameIdContext.Provider>
  );
};

export const useGameIdFromUrl = (): string | null => {
  const context = useContext(GameIdContext);
  if (context === undefined) {
    throw new Error("useGameIdFromUrl must be used within a GameIdProvider");
  }
  return context.gameId;
};
