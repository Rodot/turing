"use client";

import React, { useEffect } from "react";
import "../utils/i18n";

export default function I18nProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    // i18n initialization happens when the module is imported
    // This component just ensures it's loaded on the client side
  }, []);

  return <>{children}</>;
}
