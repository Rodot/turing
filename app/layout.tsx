import { CssBaseline, GlobalStyles } from "@mui/material";
import React from "react";

const defaultUrl = "https://turing.betalab.fr";

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
      <CssBaseline />
      <GlobalStyles
        styles={{
          body: { margin: 0, minHeight: "100vh" },
          strong: { color: "#f50057", fontWeight: 900 },
        }}
      />
      <body>{children}</body>
    </html>
  );
}
