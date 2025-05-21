import { CssBaseline, GlobalStyles } from "@mui/material";
import React from "react";

const defaultUrl = process.env["VERCEL_URL"]
  ? `https://${process.env["VERCEL_URL"]}`
  : "http://localhost:3000";

export const metadata = {
  metadataBase: new URL(defaultUrl),
  title: "The Turing Trial",
  description:
    "Can you distinguish your friend from AIs? Online party game, no account nor download required, 3-6 players.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, interactive-widget=resizes-content"
        />
      </head>
      <CssBaseline />
      <GlobalStyles
        styles={{
          body: { margin: 0, minHeight: "100dvh" },
          strong: { color: "#f50057", fontWeight: 900 },
        }}
      />
      <body>{children}</body>
    </html>
  );
}
