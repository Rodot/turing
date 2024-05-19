"use client";

import { Check, ContentCopy as ContentCopyIcon } from "@mui/icons-material";
import { Button } from "@mui/material";
import React, { useContext, useState } from "react";
import { UserProfileContext } from "./contextProvider";

export const ButtonShare: React.FC = () => {
  const [clicked, setClicked] = useState(false);
  const userProfile = useContext(UserProfileContext);

  const share = async () => {
    const url = window.location.href + "?room=" + userProfile?.room_id;
    await navigator.clipboard.writeText(url);
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
