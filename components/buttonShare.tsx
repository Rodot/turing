"use client";

import { Check, ContentCopy as ContentCopyIcon } from "@mui/icons-material";
import { Button } from "@mui/material";
import React, { useState } from "react";

export const ButtonShare: React.FC = () => {
  const [clicked, setClicked] = useState(false);
  const share = async () => {
    await navigator.clipboard.writeText(window.location.href);
    setClicked(true);
    setTimeout(() => {
      setClicked(false);
    }, 1000);
  };

  return (
    <Button onClick={share}>
      {clicked ? <Check sx={{ mr: 1 }} /> : <ContentCopyIcon sx={{ mr: 1 }} />}
      {clicked ? "Copied!" : "Copy Game Link"}
    </Button>
  );
};
