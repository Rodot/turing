import { Check, ContentCopy as ContentCopyIcon } from "@mui/icons-material";
import { Box, Button, TextField } from "@mui/material";
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
    }, 3000);
  };

  return (
    <>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <TextField
          value={urlToCopy}
          disabled
          size="small"
          variant="outlined"
          fullWidth
        />
        <Button
          variant="contained"
          color="secondary"
          onClick={share}
          disabled={clicked}
        >
          {clicked ? (
            <Check sx={{ mr: 0.5 }} />
          ) : (
            <ContentCopyIcon data-testid="ContentCopyIcon" sx={{ mr: 0.5 }} />
          )}
          {clicked ? "Copied" : "Copy"}
        </Button>
      </Box>
    </>
  );
};
