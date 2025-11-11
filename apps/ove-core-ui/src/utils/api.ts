/**
 * This is the client-side entrypoint for your tRPC API.
 * It's used to create the `api` object which contains the Next.js App-wrapper
 * as well as your typesafe react-query hooks.
 *
 * We also create a few inference helpers for input and output types
 */
import { useMutation, useQuery } from "@tanstack/react-query";
import { createTRPCReact } from "@trpc/react-query";
// IGNORE PATH - dependency removed at runtime
// eslint-disable-next-line @nx/enforce-module-boundaries
import type { AppRouter } from "../../../ove-core/src/server/router";
import type { inferRouterInputs, inferRouterOutputs } from "@trpc/server";
import type { Log } from "../pages/logs/hooks/log-store";
import { env } from "../env";
import { useStore } from "../store";
import type { User } from ".prisma/client";

/**
 * A set of typesafe react-query hooks for your tRPC API
 */
export const api = createTRPCReact<AppRouter>();

export const s3 = {
  getFileData: {
    useQuery: (
      args: { url: string },
      options?: {
        enabled: boolean;
      }
    ) =>
      useQuery({
        ...(options ?? {}),
        queryKey: ["getFileData", args.url],
        queryFn: async ({ queryKey, signal }) => {
          const res = await fetch(queryKey[1], { signal });
          return await res.text();
        }
      })
  },
  uploadFile: {
    useMutation: (options?: { enabled: boolean }) =>
      useMutation({
        ...(options ?? { enabled: true }),
        mutationFn: async ({
          payload,
          url
        }: {
          url: string;
          payload: File;
        }) => {
          await fetch(url, {
            method: "PUT",
            body: payload
          });
        }
      })
  }
};

export const logs = {
  getLogs: {
    useQuery: (
      args: {
        url: string;
        page: number;
        sorting: { [id: string]: "asc" | "desc" }[] | undefined;
        dates: { start: Date | null; end: Date | null }[] | undefined;
        appIds: string[] | undefined;
        levels: string[] | undefined;
        keywords: string[] | undefined;
      },
      options?: {
        enabled: boolean;
      }
    ) =>
      useQuery({
        ...(options ?? {}),
        queryKey: [
          "getLogs",
          args.url,
          args.page,
          JSON.stringify(args.sorting),
          JSON.stringify(args.dates),
          JSON.stringify(args.appIds),
          JSON.stringify(args.levels),
          JSON.stringify(args.keywords)
        ],
        queryFn: async ({ queryKey, signal }) => {
          const sorting =
            queryKey[3] === undefined ? undefined : `sorting=${queryKey[3]}`;
          const dates =
            queryKey[4] === undefined ? undefined : `dates=${queryKey[4]}`;
          const appIds =
            queryKey[5] === undefined ? undefined : `appIds=${queryKey[5]}`;
          const levels =
            queryKey[6] === undefined ? undefined : `levels=${queryKey[6]}`;
          const keywords =
            queryKey[7] === undefined ? undefined : `keywords=${queryKey[7]}`;
          const query = [sorting, dates, appIds, levels, keywords]
            .filter(Boolean)
            .join("&");
          const url = `${queryKey[1]}/logs/${queryKey[2]}?${query}`;
          const res = await fetch(url, {
            method: "GET",
            credentials: "include",
            signal
          });
          return (await res.json()) as Log[];
        }
      })
  },
  getPages: {
    useQuery: (
      args: {
        url: string;
        dates: { start: Date | null; end: Date | null }[] | undefined;
        appIds: string[] | undefined;
        levels: string[] | undefined;
        keywords: string[] | undefined;
      },
      options?: { enabled: boolean }
    ) =>
      useQuery({
        ...(options ?? {}),
        queryKey: [
          "getPages",
          args.url,
          JSON.stringify(args.dates),
          JSON.stringify(args.appIds),
          JSON.stringify(args.levels),
          JSON.stringify(args.keywords)
        ],
        queryFn: async ({ queryKey, signal }) => {
          const dates =
            queryKey[2] === undefined ? undefined : `dates=${queryKey[2]}`;
          const appIds =
            queryKey[3] === undefined ? undefined : `appIds=${queryKey[3]}`;
          const levels =
            queryKey[4] === undefined ? undefined : `levels=${queryKey[4]}`;
          const keywords =
            queryKey[5] === undefined ? undefined : `keywords=${queryKey[5]}`;
          const query = [dates, appIds, levels, keywords]
            .filter(Boolean)
            .join("&");
          const res = await fetch(`${queryKey[1]}/pages?${query}`, {
            method: "GET",
            credentials: "include",
            signal
          });
          return (await res.json()) as { pageCount: number; pageSize: number };
        }
      })
  },
  getAppIds: {
    useQuery: (
      args: { url: string; },
      options?: {
        enabled: boolean;
      }
    ) =>
      useQuery({
        ...(options ?? {}),
        queryKey: ["getAppIds", args.url],
        queryFn: async ({ queryKey, signal }) => {
          const res = await fetch(`${queryKey[1]}/logs/app-ids`, {
            method: "GET",
            credentials: "include",
            signal
          });
          return (await res.json()) as string[];
        }
      })
  }
};

export const auth = {
  refresh: {
    useQuery: () => useQuery({
      queryKey: ["refresh"],
      retry: false,
      queryFn: async ({ signal }) => {
        const user = (await (await fetch(`${env.CORE_URL}/api/refresh`, {credentials: "include", signal})).json()) as Omit<User, "password">;
        useStore.getState().setUser(user);
      },
    }),
  },
  login: {
    useMutation: (options?: {
      onSuccess?: () => void;
      onError?: () => void;
    }) =>
      useMutation({
        ...(options ?? {}),
        mutationKey: ["login"],
        mutationFn: async ({
          username,
          password
        }: {
          username: string | null;
          password: string | null;
        }) =>{
          const headers = username === null || password === null ? undefined : {
            Authorization: `Basic ${encodeURIComponent(btoa(`${username}:${password}`))}`
          };
          const user = (await (
            await fetch(`${env.CORE_URL}/api/login`, {
              method: "POST",
              headers,
              credentials: "include"
            })
          ).json()) as Omit<User, "password">;
          useStore.getState().setUser(user);
        }
      })
  },
  logout: {
    useMutation: (options?: Parameters<typeof useMutation>[0]) =>
      useMutation({
        ...(options ?? {}),
        mutationKey: ["logout"],
        mutationFn: async ({}: {}) => {
          await fetch(`${env.CORE_URL}/api/logout`, {
            method: "POST",
            credentials: "include"
          });
        }
      })
  },
  generateOTP: {
    useQuery: (_args: {}, options?: { enabled: boolean }) =>
      useQuery({
        ...(options ?? {}),
        queryKey: ["generateOTP"],
        queryFn: async () => {
          return (await (
            await fetch(`${env.CORE_URL}/api/otp`, {
              credentials: "include"
            })
          ).text()) as string;
        }
      })
  }
};

/**
 * Inference helper for inputs
 * @example type HelloInput = RouterInputs['example']['hello']
 **/
export type RouterInputs = inferRouterInputs<AppRouter>;
/**
 * Inference helper for outputs
 * @example type HelloOutput = RouterOutputs['example']['hello']
 **/
export type RouterOutputs = inferRouterOutputs<AppRouter>;
