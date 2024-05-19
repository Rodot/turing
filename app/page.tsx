"use client";
import { BaseLayout } from "@/components/baseLayout";
import { ContextProvider } from "@/components/contextProvider";
import { Spinner } from "@/components/spinner";
import { Suspense } from "react";

export default function Index() {
  return (
    <>
      <Suspense fallback={<Spinner />}>
        <ContextProvider>
          <BaseLayout />
        </ContextProvider>
      </Suspense>
    </>
  );
}
