"use client";

import React from "react";
import { Container, Toolbar, Typography } from "@mui/material";
import { ButtonCreateGame } from "./buttonCreateGame";

export const GameCreate: React.FC = () => {
  return (
    <Container
      maxWidth="sm"
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 2,
        p: 2,
      }}
    >
      <Toolbar /> {/* empty toolbar to avoid covering page content */}
      <Typography variant="h4" color="primary" fontWeight={900}>
        The Turing <strong>Trial</strong>
      </Typography>
      <ButtonCreateGame />
      <Typography sx={{ textAlign: "center" }}>
        ...or ask a friend for their game&apos;s link.
      </Typography>
    </Container>
  );
};
