"use client";
import { BaseLayout } from "@/components/baseLayout";
import React from "react";
import { GameRouter } from "@/components/gameRouter";

export default function GamePage() {
  return (
    <BaseLayout>
      <GameRouter />
    </BaseLayout>
  );
}
