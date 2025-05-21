"use client";
import React, { Suspense } from "react";
import { Spinner } from "./spinner";
import { QueryLoadingBar } from "./queryLoadingBar";
import { QueryErrorReporter } from "./queryErrorReporter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v13-appRouter";
import { ThemeProvider } from "@mui/material/styles";
import { theme } from "../theme";
import { SnackbarProvider } from "./snackbarContext";

// Create QueryClient instance
const queryClient = new QueryClient({});

export function BaseLayout({ children }: React.PropsWithChildren) {
  return (
    <Suspense fallback={<Spinner />}>
      <QueryClientProvider client={queryClient}>
        <AppRouterCacheProvider>
          <ThemeProvider theme={theme}>
            <SnackbarProvider>
              <QueryErrorReporter />
              <QueryLoadingBar />
              {children}
            </SnackbarProvider>
          </ThemeProvider>
        </AppRouterCacheProvider>
      </QueryClientProvider>
    </Suspense>
  );
}
