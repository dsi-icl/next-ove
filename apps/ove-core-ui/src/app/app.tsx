/* global HeadersInit */

import { env } from "../env";
import Router from "./router";
import { Toaster } from "@ove/ui-base-components";
import { api } from "../utils/api";
import { httpLink } from "@trpc/client";
import React, { useMemo } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Nav from "./nav";

export const App = () => {
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
              });
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
          queries: {},
          mutations: {},
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
