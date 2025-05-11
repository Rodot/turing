import { Check, ContentCopy as ContentCopyIcon } from "@mui/icons-material";
import { Button } from "@mui/material";
import React, { useState } from "react";

interface Props {
  url: string;
}

export const ButtonShare: React.FC<Props> = ({ url: urlToCopy }) => {
  const [clicked, setClicked] = useState(false);

  const share = async () => {
    await navigator.clipboard.writeText(urlToCopy);
    setClicked(true);
    setTimeout(() => {
      setClicked(false);
    }, 1000);
  };

  return (
    <Button variant="contained" color="secondary" onClick={share}>
      {clicked ? <Check sx={{ mr: 1 }} /> : <ContentCopyIcon sx={{ mr: 1 }} />}
      {clicked ? "Link Copied!" : "Copy Game Link"}
    </Button>
  );
};
