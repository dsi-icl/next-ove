/* global HeadersInit */

import { env } from "../env";
import Router from "./router";
import {
  Avatar,
  AvatarFallback,
  AvatarImage, Badge,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  NavigationMenuLink,
  Toaster
} from "@ove/ui-base-components";
import { api } from "../utils/api";
import { useStore } from "../store";
import { httpLink } from "@trpc/client";
import { useAuth } from "../hooks/auth";
import { Nav } from "@ove/ui-components";
import { useNavigate } from "react-router-dom";
import { HddStack } from "react-bootstrap-icons";
import React, { useEffect, useState, useMemo, useCallback } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { isError } from "@ove/ove-types";

const Persona = ({ logout }: { logout: () => void }) => {
  const user = useStore(state => state.user);
  const navigate = useNavigate();
  const getPendingInviteCount = api.projects.getPendingInviteCount.useQuery();

  return user !== null ? <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Avatar className="mr-1 cursor-pointer">
    <AvatarImage src={user.icon ?? undefined}
                 alt={user.name ?? "collaborator name"} />
    <AvatarFallback>{user.name?.charAt(0) ?? "?"}</AvatarFallback>
    </Avatar>
    </DropdownMenuTrigger>
    <DropdownMenuContent className="w-56">
      <DropdownMenuLabel>My Account</DropdownMenuLabel>
      <DropdownMenuSeparator />
      <DropdownMenuItem className="cursor-pointer flex" onClick={() => navigate("/collaboration")}>
        Invites
        {getPendingInviteCount.status === "success" && !isError(getPendingInviteCount.data) ? <Badge variant="destructive" className="ml-auto">{getPendingInviteCount.data}</Badge> : null}
      </DropdownMenuItem>
      <DropdownMenuItem className="cursor-pointer" onClick={logout}>Log out</DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu> : null;
};

export const App = () => {
  const { loggedIn, login, logout, tokens, refresh } = useAuth();

  const navContent = [
    {
      title: "Hardware",
      item: null,
      card: <ul
        className="grid gap-3 p-6 md:w-[400px] lg:w-[500px]
        lg:grid-cols-[.75fr_1fr]">
        <li className="row-span-3">
          <NavigationMenuLink asChild>
            <a
              className="flex h-full w-full select-none flex-col justify-end
              rounded-md bg-gradient-to-b from-muted/50 to-muted p-6
              no-underline outline-none focus:shadow-md"
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
              className="block select-none space-y-1 rounded-md p-3
              leading-none no-underline outline-none transition-colors
              hover:bg-accent hover:text-accent-foreground focus:bg-accent
              focus:text-accent-foreground"
              href={`${env.BASE_URL}/sockets`}
            >
              <div className="text-sm font-medium leading-none">Sockets</div>
              <p
                className="line-clamp-2 text-sm leading-snug
                text-muted-foreground">
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
        <Persona logout={logout} /> :
        <Button style={{
          color: "white",
          padding: "1rem",
          fontWeight: 700
        }}>Login</Button>,
      card: null,
      location: loggedIn ? null : "/login"
    }
  ];

  const createTrpcClient = useCallback(() => api.createClient({
    links: [
      httpLink({
        url: `${env.CORE_URL}/api/v${env.CORE_API_VERSION}/trpc`,
        async headers() {
          return { authorization: `Bearer ${tokens?.access}` };
        },
        fetch: async (url, options): Promise<Response> => {
          const res = await fetch(url, options);

          if (res.status === 207) {
            const responses = await res.json() as {
              error: { data: { httpStatus: number } }
            }[];

            if (responses.some(r => r.error.data.httpStatus === 401)) {
              const refreshedTokens = await refresh();
              if (options?.headers !== undefined) {
                options.headers["authorization" as keyof HeadersInit] =
                  `Bearer ${refreshedTokens?.access}`;
              }
              return await fetch(url, options);
            }
          }

          if (res.status === 401) {
            const refreshedTokens = await refresh();
            if (options?.headers !== undefined) {
              options.headers["authorization" as keyof HeadersInit] =
                `Bearer ${refreshedTokens?.access}`;
            }
            return await fetch(url, options);
          }

          return res;
        }
      })
    ]
  }), [refresh, tokens?.access]);

  const [trpcClient, setTrpcClient] = useState(createTrpcClient);

  useEffect(() => {
    setTrpcClient(createTrpcClient);
  }, [loggedIn, createTrpcClient]);

  const queryClient = useMemo<QueryClient>(() => new QueryClient({
    defaultOptions: {
      queries: {},
      mutations: {}
    }
  }), []);

  return <api.Provider client={trpcClient} queryClient={queryClient}>
    <QueryClientProvider client={queryClient}>
      <Nav icon={{ asset: `${env.BASE_URL}/logo.svg`, alt: "OVE Core Logo" }}
           content={navContent} />
      <Router loggedIn={loggedIn} login={login} />
      <Toaster closeButton richColors />
    </QueryClientProvider>
  </api.Provider>;
};

export default App;
