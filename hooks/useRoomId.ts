import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

export const useRoomId = () => {
  const [roomId, setRoomId] = useState("");
  const searchParams = useSearchParams();

  useEffect(() => {
    const newRoomId = searchParams.get("room") ?? null;
    if (newRoomId?.length && newRoomId !== roomId) {
      setRoomId(newRoomId);
    }
  }, [searchParams, roomId]);

  return roomId;
};
