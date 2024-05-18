"use client";
import { Chat } from "@/components/chat";
import { GroupContext } from "@/components/contextProvider";
import { GameCreate } from "@/components/gameCreate";
import { useContext } from "react";

export default function Index() {
  const group = useContext(GroupContext);

  if (!group?.id) return <GameCreate />;

  return <Chat />;
}
