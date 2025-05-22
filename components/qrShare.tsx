"use client";

import React from "react";
import { Box } from "@mui/material";
import QRCode from "react-qr-code";

interface QRShareProps {
  url: string;
}

export const QRShare: React.FC<QRShareProps> = ({ url }) => {
  return (
    <Box sx={{ px: 2, pb: 2 }}>
      <QRCode
        size={360}
        value={url}
        style={{ height: "auto", maxWidth: "100%", width: "100%" }}
      />
    </Box>
  );
};
