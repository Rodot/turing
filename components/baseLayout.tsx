"use client";
import React, { Suspense } from "react";
import { AppBar, Box, Toolbar, Typography } from "@mui/material";
import { ButtonLeaveGame } from "./buttonLeaveGame";
import Link from "next/link";
import { Spinner } from "./spinner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ContextProvider } from "./contextProvider";

export function BaseLayout({ children }: React.PropsWithChildren) {
  const queryClient = new QueryClient();
  return (
    <>
      <QueryClientProvider client={queryClient}>
        <ContextProvider>
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
          <Suspense fallback={<Spinner />}>{children}</Suspense>
        </ContextProvider>
      </QueryClientProvider>
    </>
  );
}
