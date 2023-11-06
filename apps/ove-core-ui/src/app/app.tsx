import { env } from "../env";
import Router from "./router";
import { useState } from "react";
import superjson from "superjson";
import { useAuth } from "../hooks";
import { trpc } from "../utils/api";
import { httpLink } from "@trpc/client";
import { Nav } from "@ove/ui-components";
import { HddStack } from "react-bootstrap-icons";
import { NavigationMenuLink } from "@ove/ui-base-components";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

export const App = () => {
  const { loggedIn, logout, tokens, refresh } = useAuth();
  const navContent = [
    {
      title: "Hardware",
      item: null,
      card: <ul
        className="grid gap-3 p-6 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
        <li className="row-span-3">
          <NavigationMenuLink asChild>
            <a
              className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md"
              href={`${env.BASE_URL}/hardware`}
            >
              <HddStack />
              <h4 className="mb-2 mt-4 text-lg font-medium">
                Hardware Manager
              </h4>
              <p
                className="text-sm leading-tight text-muted-foreground">
                Manage all connected hardware.
              </p>
            </a>
          </NavigationMenuLink>
        </li>
        <li>
          <NavigationMenuLink asChild>
            <a
              className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
              href={`${env.BASE_URL}/sockets`}
            >
              <div className="text-sm font-medium leading-none">Sockets</div>
              <p
                className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                Socket.IO Admin UI
              </p>
            </a>
          </NavigationMenuLink>
        </li>
      </ul>,
      location: null
    },
    {
      title: loggedIn ? "Logout" : "Login",
      item: loggedIn ?
        <button onClick={logout} style={{
          color: "white",
          padding: "1rem",
          fontWeight: 700
        }}>Logout</button> :
        <div style={{
          color: "white",
          padding: "1rem",
          fontWeight: 700
        }}>Login</div>,
      card: null,
      location: loggedIn ? null : "/login"
    }
  ];

  const [trpcClient] = useState(() => trpc.createClient({
    links: [
      httpLink({
        url: `${env.CORE_URL}/api/v${env.CORE_API_VERSION}/trpc`,
        async headers() {
          return { authorization: `Bearer ${tokens?.access}` };
        },
        fetch: async (url, options): Promise<Response> => {
          const res = await fetch(url, options);

          if (res.status === 207) {
            const responses = await res.json() as {error: {data: {httpStatus: number}}}[];

            if (responses.some(r => r.error.data.httpStatus === 401)) {
              const refreshedTokens = await refresh();
              if (options?.headers !== undefined) {
                options.headers["authorization" as keyof HeadersInit] = `Bearer ${refreshedTokens?.access}`;
              }
              return await fetch(url, options);
            }
          }

          if (res.status === 401) {
            const refreshedTokens = await refresh();
            if (options?.headers !== undefined) {
              options.headers["authorization" as keyof HeadersInit] = `Bearer ${refreshedTokens?.access}`;
            }
            return await fetch(url, options);
          }

          return res;
        }
      })
    ],
    transformer: superjson
  }));

  const [queryClient,] = useState<QueryClient>(() => new QueryClient({defaultOptions: {queries: {}, mutations: {}}}));

  return <trpc.Provider client={trpcClient} queryClient={queryClient}>
    <QueryClientProvider client={queryClient}>
      <Nav icon={{ asset: `${env.BASE_URL}/logo.svg`, alt: "OVE Core Logo" }}
           content={navContent} />
      <Router />
    </QueryClientProvider>
  </trpc.Provider>;
};

export default App;
