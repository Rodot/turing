import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";

export const useRoomId = () => {
  const [roomId, setRoomId] = useState("");
  const searchParams = useSearchParams();

  useEffect(() => {
    const newRoomId = searchParams.get("room") ?? null;
    if (newRoomId?.length) {
      setRoomId(newRoomId);
    }
  }, [searchParams]);

  return roomId;
};
