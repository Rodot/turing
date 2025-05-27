import { Box, Button, TextField } from "@mui/material";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";

interface Props {
  url: string;
}

export const ButtonShare: React.FC<Props> = ({ url: urlToCopy }) => {
  const { t } = useTranslation();
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
          📋&nbsp;{clicked ? t("buttons.copied") : t("buttons.copy")}
        </Button>
      </Box>
    </>
  );
};
