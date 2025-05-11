"use client";
import { BaseLayout } from "@/components/baseLayout";
import { SignUp } from "@/components/signUp";
import React from "react";

export default function HomePage() {
  return (
    <BaseLayout>
      <SignUp />
    </BaseLayout>
  );
}
