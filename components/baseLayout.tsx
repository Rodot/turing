"use client";
import React, { Suspense } from "react";
import { AppBar, Box, Toolbar, Typography } from "@mui/material";
import { ButtonLeaveGame } from "./buttonLeaveGame";
import Link from "next/link";
import { Spinner } from "./spinner";
import { ContextProvider } from "./contextProvider";
import { QueryLoadingBar } from "./queryLoadingBar";
import { QueryErrorReporter } from "./queryErrorReporter";

export function BaseLayout({ children }: React.PropsWithChildren) {
  return (
    <Suspense fallback={<Spinner />}>
      <ContextProvider>
        <QueryErrorReporter />
        <AppBar>
          <Toolbar>
            <Box sx={{ flexGrow: "1" }}>
              <Link href="/" style={{ textDecoration: "none" }}>
                <Typography sx={{ fontWeight: "900", color: "white" }}>
                  The Turing <strong>Trial</strong>
                </Typography>
              </Link>
            </Box>
            <ButtonLeaveGame />
          </Toolbar>
        </AppBar>
        <Toolbar /> {/* empty toolbar to avoid covering page content */}
        <QueryLoadingBar />
        {children}
      </ContextProvider>
    </Suspense>
  );
}
