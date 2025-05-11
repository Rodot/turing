"use client";

import React from "react";
import { Box } from "@mui/material";
import QRCode from "react-qr-code";

interface QRShareProps {
  url: string;
}

export const QRShare: React.FC<QRShareProps> = ({ url }) => {
  return (
    <Box>
      <QRCode size={150} value={url} />
    </Box>
  );
};
