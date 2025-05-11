"use client";
import React from "react";
import { AppBar, Box, Toolbar, Typography } from "@mui/material";
import { ButtonLeaveGame } from "./buttonLeaveGame";
import Link from "next/link";

export function BaseLayout({ children }: React.PropsWithChildren) {
  return (
    <>
      <AppBar>
        <Toolbar>
          <Box sx={{ flexGrow: "1" }}>
            <Link href="/" style={{ textDecoration: "none" }}>
              <Typography sx={{ fontWeight: "900", color: "white" }}>
                The Turing <strong>Trial</strong>
              </Typography>
            </Link>
          </Box>
          <ButtonLeaveGame label={"leave"} />
        </Toolbar>
      </AppBar>
      {children}
    </>
  );
}
