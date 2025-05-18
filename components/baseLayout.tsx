"use client";
import React, { Suspense } from "react";
import { AppBar, Box, Toolbar, Typography } from "@mui/material";
import { ButtonLeaveGame } from "./buttonLeaveGame";
import Link from "next/link";
import { Spinner } from "./spinner";
import { QueryLoadingBar } from "./queryLoadingBar";
import { QueryErrorReporter } from "./queryErrorReporter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v13-appRouter";
import { ThemeProvider } from "@mui/material/styles";
import { theme } from "../theme";
import { SnackbarProvider } from "./snackbarContext";

// Create QueryClient instance
const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 1000 * 60 * 5 } }, // 5 minutes
});

export function BaseLayout({ children }: React.PropsWithChildren) {
  return (
    <Suspense fallback={<Spinner />}>
      <QueryClientProvider client={queryClient}>
        <AppRouterCacheProvider>
          <ThemeProvider theme={theme}>
            <SnackbarProvider>
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
            </SnackbarProvider>
          </ThemeProvider>
        </AppRouterCacheProvider>
      </QueryClientProvider>
    </Suspense>
  );
}
