"use client";
import { BaseLayout } from "@/components/baseLayout";
import { Chat } from "@/components/chat";
import { ContextProvider, GroupContext } from "@/components/contextProvider";
import { GameCreate } from "@/components/gameCreate";
import { CircularProgress } from "@mui/material";
import { Suspense, useContext } from "react";

export default function Index() {
  const group = useContext(GroupContext);

  const content = !group?.id ? <GameCreate /> : <Chat />;

  return (
    <>
      <Suspense fallback={<CircularProgress />}>
        <ContextProvider>
          <BaseLayout>{content}</BaseLayout>
        </ContextProvider>
      </Suspense>
    </>
  );
}
