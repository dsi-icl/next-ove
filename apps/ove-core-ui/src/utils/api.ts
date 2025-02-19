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

/**
 * A set of typesafe react-query hooks for your tRPC API
 */
export const api = createTRPCReact<AppRouter>();

export const custom = {
  getFileData: {
    useQuery: (
      args: { url: string },
      options?: {
        enabled: boolean;
      },
    ) =>
      useQuery({
        ...(options ?? {}),
        queryKey: ["getFileData", args.url],
        queryFn: async ({ queryKey, signal }) => {
          const res = await fetch(queryKey[1], { signal });
          return await res.text();
        },
      }),
  },
  uploadFile: {
    useMutation: (options?: { enabled: boolean }) =>
      useMutation({
        ...(options ?? { enabled: true }),
        mutationFn: async ({
          payload,
          url,
        }: {
          url: string;
          payload: File;
        }) => {
          await fetch(url, {
            method: "PUT",
            body: payload,
          });
        },
      }),
  },
  getLogs: {
    useQuery: (
      args: {
        url: string;
        token: string;
        page: number;
        sorting: { [id: string]: "asc" | "desc" }[] | undefined;
        dates: { start: Date | null; end: Date | null }[] | undefined;
        appIds: string[] | undefined;
        levels: string[] | undefined;
        keywords: string[] | undefined;
      },
      options?: {
        enabled: boolean;
      },
    ) =>
      useQuery({
        ...(options ?? {}),
        queryKey: [
          "getLogs",
          args.url,
          args.token,
          args.page,
          JSON.stringify(args.sorting),
          JSON.stringify(args.dates),
          JSON.stringify(args.appIds),
          JSON.stringify(args.levels),
          JSON.stringify(args.keywords),
        ],
        queryFn: async ({ queryKey, signal }) => {
          const sorting =
            queryKey[4] === undefined ? undefined : `sorting=${queryKey[4]}`;
          const dates =
            queryKey[5] === undefined ? undefined : `dates=${queryKey[5]}`;
          const appIds =
            queryKey[6] === undefined ? undefined : `appIds=${queryKey[6]}`;
          const levels =
            queryKey[7] === undefined ? undefined : `levels=${queryKey[7]}`;
          const keywords =
            queryKey[8] === undefined ? undefined : `keywords=${queryKey[8]}`;
          const query = [sorting, dates, appIds, levels, keywords]
            .filter(Boolean)
            .join("&");
          const url = `${queryKey[1]}/logs/${queryKey[3]}?${query}`;
          const res = await fetch(url, {
            headers: { Authorization: `Bearer ${queryKey[2]}` },
            method: "GET",
            signal,
          });
          return (await res.json()) as Log[];
        },
      }),
  },
  getPages: {
    useQuery: (
      args: {
        url: string;
        token: string;
        dates: { start: Date | null; end: Date | null }[] | undefined;
        appIds: string[] | undefined;
        levels: string[] | undefined;
        keywords: string[] | undefined;
      },
      options?: { enabled: boolean },
    ) =>
      useQuery({
        ...(options ?? {}),
        queryKey: [
          "getPages",
          args.url,
          args.token,
          JSON.stringify(args.dates),
          JSON.stringify(args.appIds),
          JSON.stringify(args.levels),
          JSON.stringify(args.keywords),
        ],
        queryFn: async ({ queryKey, signal }) => {
          const dates =
            queryKey[3] === undefined ? undefined : `dates=${queryKey[3]}`;
          const appIds =
            queryKey[4] === undefined ? undefined : `appIds=${queryKey[4]}`;
          const levels =
            queryKey[5] === undefined ? undefined : `levels=${queryKey[5]}`;
          const keywords =
            queryKey[6] === undefined ? undefined : `keywords=${queryKey[6]}`;
          const query = [dates, appIds, levels, keywords]
            .filter(Boolean)
            .join("&");
          const res = await fetch(`${queryKey[1]}/pages?${query}`, {
            headers: { Authorization: `Bearer ${queryKey[2]}` },
            method: "GET",
            signal,
          });
          return (await res.json()) as { pageCount: number; pageSize: number };
        },
      }),
  },
  getAppIds: {
    useQuery: (
      args: { url: string; token: string },
      options?: {
        enabled: boolean;
      },
    ) =>
      useQuery({
        ...(options ?? {}),
        queryKey: ["getAppIds", args.url, args.token],
        queryFn: async ({ queryKey, signal }) => {
          const res = await fetch(`${queryKey[1]}/logs/app-ids`, {
            headers: { Authorization: `Bearer ${queryKey[2]}` },
            method: "GET",
            signal,
          });
          return (await res.json()) as string[];
        },
      }),
  },
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
