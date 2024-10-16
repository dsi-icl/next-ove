/**
 * This is the client-side entrypoint for your tRPC API.
 * It's used to create the `api` object which contains the Next.js App-wrapper
 * as well as your typesafe react-query hooks.
 *
 * We also create a few inference helpers for input and output types
 */
import { createTRPCReact } from "@trpc/react-query";
// IGNORE PATH - dependency removed at runtime
// eslint-disable-next-line @nx/enforce-module-boundaries
import type { AppRouter } from "../../../ove-core/src/server/router";
import type { inferRouterInputs, inferRouterOutputs } from "@trpc/server";

/**
 * A set of typesafe react-query hooks for your tRPC API
 */
export const api = createTRPCReact<AppRouter>();

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
