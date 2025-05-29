"use client";
import React, { Suspense } from "react";
import { Spinner } from "./spinner";
import { QueryErrorReporter } from "./queryErrorReporter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v13-appRouter";
import { ThemeProvider } from "@mui/material/styles";
import { theme } from "../theme";
import { SnackbarProvider } from "./snackbarContext";
import I18nProvider from "./i18nProvider";
import { GameIdProvider } from "./gameIdProvider";
import { RealtimeSubscriptions } from "./realtimeSubscriptions";

// Create QueryClient instance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
    },
  },
});

export function BaseLayout({ children }: React.PropsWithChildren) {
  console.log("BaseLayout rendered");
  return (
    <Suspense fallback={<Spinner />}>
      <I18nProvider>
        <QueryClientProvider client={queryClient}>
          <AppRouterCacheProvider>
            <ThemeProvider theme={theme}>
              <SnackbarProvider>
                <GameIdProvider>
                  <RealtimeSubscriptions />
                  <QueryErrorReporter />
                  {children}
                </GameIdProvider>
              </SnackbarProvider>
            </ThemeProvider>
          </AppRouterCacheProvider>
        </QueryClientProvider>
      </I18nProvider>
    </Suspense>
  );
}
