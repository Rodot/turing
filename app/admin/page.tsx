"use client";
import { BaseLayout } from "@/components/baseLayout";
import { AdminGames } from "@/components/adminGames";
import React from "react";

export default function AdminPage() {
  return (
    <BaseLayout>
      <AdminGames />
    </BaseLayout>
  );
}
