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

/**
 * A set of typesafe react-query hooks for your tRPC API
 */
export const api = createTRPCReact<AppRouter>();

export const custom = {
  getFileData: {
    useQuery: (args: { url: string }, options?: {enabled: boolean}) => useQuery({...(options ?? {}), queryKey: ["getFileData", args.url], queryFn: async ({queryKey, signal}) => {
        const res = await fetch(queryKey[1], {signal});
        return await res.text();
      }})
  },
  uploadFile: {
    useMutation: (options?: { enabled: boolean }) => useMutation({...(options ?? {enabled: true}), mutationFn: async ({payload, url}: { url: string, payload: File }) => {
        await fetch(url, {
          method: "PUT",
          body: payload
        });
      }})
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
