"use client";
import { ContextProvider } from "@/components/contextProvider";
import { BaseLayout } from "@/components/baseLayout";
import { Spinner } from "@/components/spinner";
import React, { Suspense } from "react";
import { GameRouter } from "@/components/gameRouter";

export default function GamePage() {
  return (
    <>
      <Suspense fallback={<Spinner />}>
        <ContextProvider>
          <BaseLayout>
            <GameRouter />
          </BaseLayout>
        </ContextProvider>
      </Suspense>
    </>
  );
}
