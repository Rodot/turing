import { CssBaseline, GlobalStyles } from "@mui/material";
import React from "react";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata = {
  metadataBase: new URL(defaultUrl),
  title: "The Turing Trial by BetaLab.fr",
  description: "Can you distinguish AIs from your friends?",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <CssBaseline />
      <GlobalStyles
        styles={{ strong: { color: "#f50057", fontWeight: 900 } }}
      />
      <body style={{ margin: 0 }}>{children}</body>
    </html>
  );
}
