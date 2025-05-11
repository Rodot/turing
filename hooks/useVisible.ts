"use client";

import { useEffect, useState } from "react";

export function useVisible() {
  const [isVisible, setIsVisible] = useState(true);

  // update document visiblity
  useEffect(() => {
    if (typeof window !== "undefined" && typeof document !== "undefined") {
      const handleVisibilityChange = () => {
        setIsVisible(!document.hidden);
      };
      document.addEventListener("visibilitychange", handleVisibilityChange);
      return () => {
        document.removeEventListener(
          "visibilitychange",
          handleVisibilityChange,
        );
      };
    }
    return undefined;
  }, []);

  return isVisible;
}
