/* global HeadersInit */

import { env } from "../env";
import Router from "./router";
import { Toaster } from "@ove/ui-base-components";
import { api } from "../utils/api";
import { httpLink } from "@trpc/client";
import React, { useMemo } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Nav from "./nav";

const App = () => {
  const trpcClient = useMemo(
    () =>
      api.createClient({
        links: [
          httpLink({
            url: `${env.CORE_URL}/api/v${env.CORE_API_VERSION}/trpc`,
            fetch(url, options) {
              return fetch(url, {
                ...options,
                credentials: "include",
              } as Parameters<(typeof fetch)>[1]);
            },
          }),
        ],
      }),
    [],
  );

  const queryClient = useMemo<QueryClient>(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: 1,
            staleTime: 30_000,
          },
          mutations: {
            retry: 0,
          },
        },
      }),
    [],
  );

  return (
    <api.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <Nav />
        <Router />
        <Toaster closeButton richColors />
      </QueryClientProvider>
    </api.Provider>
  );
};

export default App;
