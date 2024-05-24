import { Check, ContentCopy as ContentCopyIcon } from "@mui/icons-material";
import { Button, SxProps, Theme } from "@mui/material";
import React, { useState } from "react";

interface Props {
  url: string;
  sx?: SxProps<Theme>;
}

export const ButtonShare: React.FC<Props> = ({ url: urlToCopy, sx }) => {
  const [clicked, setClicked] = useState(false);

  const share = async () => {
    await navigator.clipboard.writeText(urlToCopy);
    setClicked(true);
    setTimeout(() => {
      setClicked(false);
    }, 1000);
  };

  return (
    <Button variant="contained" color="secondary" onClick={share} sx={sx}>
      {clicked ? <Check sx={{ mr: 1 }} /> : <ContentCopyIcon sx={{ mr: 1 }} />}
      {clicked ? "Link Copied!" : "Copy Game Link"}
    </Button>
  );
};
