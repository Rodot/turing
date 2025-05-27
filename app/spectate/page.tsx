"use client";

import React from "react";
import { BaseLayout } from "@/components/baseLayout";
import { SpectatorGameRouter } from "@/components/spectatorGameRouter";

export default function SpectatePage() {
  return (
    <BaseLayout>
      <SpectatorGameRouter />
    </BaseLayout>
  );
}
