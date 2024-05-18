"use client";

import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
  typography: {
    fontFamily: "sans-serif",
  },
  palette: {
    primary: {
      main: "#3f51b5",
    },
    secondary: {
      main: "#f50057",
    },
    background: {
      default: "#f0f0f0",
    },
  },
});
