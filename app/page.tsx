"use client";
import { BaseLayout } from "@/components/baseLayout";
import { ContextProvider } from "@/components/contextProvider";
import { CircularProgress } from "@mui/material";
import { Suspense } from "react";

export default function Index() {
  return (
    <>
      <Suspense fallback={<CircularProgress />}>
        <ContextProvider>
          <BaseLayout />
        </ContextProvider>
      </Suspense>
    </>
  );
}
