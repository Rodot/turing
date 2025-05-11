"use client";

import React from "react";
import { Box, Typography } from "@mui/material";
import QRCode from "react-qr-code";

interface QRShareProps {
  url: string;
}

export const QRShare: React.FC<QRShareProps> = ({ url }) => {
  return (
    <Box>
      <Typography sx={{ fontWeight: "bold", textAlign: "center" }}>
        Scan to join 👇
      </Typography>
      <QRCode size={150} value={url} />
    </Box>
  );
};
